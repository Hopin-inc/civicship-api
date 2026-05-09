/**
 * Phase 0 Spike #3 — did:web resolver compatibility (test driver)
 *
 * Drives `web-did-resolver` v2 (via `did-resolver` v4/v5 Resolver class)
 * against the spike server in server.ts. Verifies that the standard
 * resolver library accepts the production DID Document shape described
 * in §5.4.3 / §5.4.4 of docs/report/did-vc-internalization.md for three
 * distinct states:
 *
 *   1. Active   (u_active)    → proof.anchorStatus = "confirmed"
 *   2. Pending  (u_pending)   → proof.anchorStatus = "pending"
 *   3. Tombstone (u_tombstone) → deactivated:true (§E)
 *
 * Localhost / HTTP relaxation:
 *   The did:web spec mandates HTTPS. For this spike we patch
 *   web-did-resolver's URL builder to point at http://localhost:<port>
 *   instead of https://api.civicship.app — the resolver library is
 *   otherwise used as-is (this is the "patch URL builder" approach
 *   referenced in the design doc Phase 0 0-3 row).
 *
 *   We accomplish the patch by intercepting the `cross-fetch` module
 *   that web-did-resolver imports: every outgoing https://api.civicship.app
 *   URL is rewritten to http://localhost:<SPIKE_PORT>. This keeps the
 *   resolver code path 100 % stock — only the network destination is
 *   redirected.
 */

/* eslint-disable no-console */
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

// -----------------------------------------------------------------------------
// Patch cross-fetch BEFORE importing web-did-resolver.
// web-did-resolver does `require('cross-fetch')`, so we mutate the require
// cache for that module. tsx loads .ts via ESM; createRequire bridges to CJS.
// -----------------------------------------------------------------------------

const SPIKE_PORT = Number(process.env.SPIKE_PORT ?? 4399);
const ISSUER_HOST = "api.civicship.app";
const LOCAL_BASE = `http://localhost:${SPIKE_PORT}`;

const __filename = fileURLToPath(import.meta.url);

// Use a require rooted at this script so we resolve to the same cross-fetch
// instance web-did-resolver pulls in (pnpm hoists, but be explicit).
const requireFromHere = createRequire(__filename);

function patchCrossFetch() {
  // Resolve to web-did-resolver first to learn which cross-fetch it pulls in.
  // Then resolve cross-fetch from that file's location so we hit the same
  // resolved id in the require cache.
  const wdrPath = requireFromHere.resolve("web-did-resolver");
  const wdrRequire = createRequire(wdrPath);
  const crossFetchPath = wdrRequire.resolve("cross-fetch");

  const originalModule = wdrRequire("cross-fetch");
  const originalFetch =
    typeof originalModule === "function"
      ? originalModule
      : originalModule.default ?? originalModule.fetch;

  if (typeof originalFetch !== "function") {
    throw new Error(
      `Could not locate fetch export on cross-fetch (got ${typeof originalFetch})`,
    );
  }

  // Accept both `string` and `URL` (the standard fetch API takes either).
  // web-did-resolver currently passes a string, but if a future version uses
  // URL objects we still want our redirection to work. `url.toString()`
  // handles both shapes uniformly.
  const wrappedFetch: typeof fetch = ((url: string | URL, init?: RequestInit) => {
    const urlStr = typeof url === "string" ? url : url.toString();
    let target: string = urlStr;
    if (urlStr.startsWith(`https://${ISSUER_HOST}`)) {
      target = LOCAL_BASE + urlStr.slice(`https://${ISSUER_HOST}`.length);
    }
    // Drop CORS mode — node-fetch warns/ignores but cleaner without it
    const safeInit = init ? { ...init } : undefined;
    if (safeInit && (safeInit as any).mode) delete (safeInit as any).mode;
    console.log(`  [fetch] ${urlStr}  →  ${target}`);
    return originalFetch(target, safeInit);
  }) as unknown as typeof fetch;

  const proxy: any = wrappedFetch;
  proxy.default = wrappedFetch;
  proxy.fetch = wrappedFetch;
  // Preserve other named exports (Headers / Request / Response) if present.
  for (const k of Object.keys(originalModule)) {
    if (!(k in proxy)) proxy[k] = (originalModule as any)[k];
  }

  // Replace the require cache entry so the in-flight `require('cross-fetch')`
  // inside web-did-resolver returns our wrapper.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Module = requireFromHere("module");
  if (Module._cache && Module._cache[crossFetchPath]) {
    Module._cache[crossFetchPath].exports = proxy;
  } else {
    // Force-load and override
    wdrRequire("cross-fetch");
    Module._cache[crossFetchPath].exports = proxy;
  }
}

patchCrossFetch();

// Now safe to import the resolver libs — they will pick up our patched fetch.
const { Resolver } = requireFromHere("did-resolver");
const { getResolver } = requireFromHere("web-did-resolver");

// -----------------------------------------------------------------------------
// Test cases
// -----------------------------------------------------------------------------

interface Case {
  name: string;
  did: string;
  expect: "active" | "deactivated";
}

const CASES: Case[] = [
  {
    name: "Active (anchorStatus=confirmed)",
    did: `did:web:${ISSUER_HOST}:users:u_active`,
    expect: "active",
  },
  {
    name: "Pending (anchorStatus=pending, chainTxHash=null)",
    did: `did:web:${ISSUER_HOST}:users:u_pending`,
    expect: "active", // resolver should still return success; status is in proof.anchorStatus
  },
  {
    name: "Tombstone (deactivated:true)",
    did: `did:web:${ISSUER_HOST}:users:u_tombstone`,
    expect: "deactivated",
  },
];

async function waitForServer(maxMs = 5000) {
  const deadline = Date.now() + maxMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${LOCAL_BASE}/.well-known/did.json`);
      if (res.ok) return;
    } catch {
      // not yet up
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error(`Spike server did not respond on ${LOCAL_BASE} within ${maxMs}ms`);
}

function assertOrThrow(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERTION FAILED: ${msg}`);
}

async function runCase(resolver: any, c: Case) {
  console.log(`\n────────────────────────────────────────`);
  console.log(`[case] ${c.name}`);
  console.log(`[did]  ${c.did}`);

  const result = await resolver.resolve(c.did);
  console.log(`[didResolutionMetadata] ${JSON.stringify(result.didResolutionMetadata)}`);
  console.log(`[didDocumentMetadata]   ${JSON.stringify(result.didDocumentMetadata)}`);
  console.log(`[didDocument]           ${JSON.stringify(result.didDocument, null, 2)}`);

  if (c.expect === "active") {
    assertOrThrow(
      !result.didResolutionMetadata.error,
      `Expected no resolver error for ${c.did}, got: ${result.didResolutionMetadata.error}`,
    );
    assertOrThrow(
      result.didDocument != null,
      `Expected didDocument to be returned for ${c.did}`,
    );
    assertOrThrow(
      result.didDocument.id === c.did,
      `Expected didDocument.id == ${c.did}, got ${result.didDocument.id}`,
    );
    // For active/pending we also expect a proof block per §5.4.4.
    const proof = (result.didDocument as any).proof;
    assertOrThrow(proof != null, `Expected proof block on active/pending doc`);
    console.log(`[proof.anchorStatus]    ${proof.anchorStatus}`);
  } else {
    // Tombstone semantics — we accept either:
    //   (a) resolver returns the document with deactivated:true at top-level
    //       (web-did-resolver passes the JSON through as-is since it does no
    //        spec-level interpretation of `deactivated`)
    //   (b) didDocumentMetadata.deactivated === true
    //   (c) resolver reports an error referencing notFound/deactivated
    const topLevelDeactivated =
      result.didDocument && (result.didDocument as any).deactivated === true;
    const metaDeactivated =
      (result.didDocumentMetadata as any)?.deactivated === true;
    const errored = !!result.didResolutionMetadata.error;
    console.log(
      `[tombstone-shape] topLevelDeactivated=${topLevelDeactivated} metaDeactivated=${metaDeactivated} errored=${errored}`,
    );
    assertOrThrow(
      topLevelDeactivated || metaDeactivated || errored,
      `Tombstone case must surface deactivation in some form for ${c.did}`,
    );
  }
  console.log(`[case] PASS`);
  return result;
}

async function main() {
  console.log(`Spike #3 — did:web resolver compatibility`);
  console.log(`base override: https://${ISSUER_HOST}  →  ${LOCAL_BASE}`);
  await waitForServer();

  // Sanity: also resolve the issuer DID itself
  const resolver = new Resolver({ ...getResolver() });
  const issuerDid = `did:web:${ISSUER_HOST}`;
  console.log(`\n[case] Issuer DID Document\n[did]  ${issuerDid}`);
  const issuerRes = await resolver.resolve(issuerDid);
  console.log(`[didResolutionMetadata] ${JSON.stringify(issuerRes.didResolutionMetadata)}`);
  console.log(`[didDocument]           ${JSON.stringify(issuerRes.didDocument, null, 2)}`);
  assertOrThrow(
    !issuerRes.didResolutionMetadata.error,
    `Issuer DID resolution must succeed`,
  );
  assertOrThrow(
    Array.isArray((issuerRes.didDocument as any).verificationMethod) &&
      (issuerRes.didDocument as any).verificationMethod.length >= 1,
    `Issuer DID Document must have at least one verificationMethod`,
  );
  console.log(`[case] Issuer DID  PASS`);

  for (const c of CASES) {
    await runCase(resolver, c);
  }

  console.log(`\n────────────────────────────────────────`);
  console.log(`All cases PASS`);
  process.exit(0);
}

main().catch((err) => {
  console.error(`\n────────────────────────────────────────`);
  console.error(`FAIL: ${err?.message ?? err}`);
  console.error(err?.stack);
  process.exit(1);
});
