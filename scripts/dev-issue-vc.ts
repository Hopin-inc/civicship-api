#!/usr/bin/env -S node --experimental-strip-types
/**
 * End-to-end exerciser for the Phase 2 KMS-backed VC issuance path on dev.
 *
 * Mints a Firebase ID token for a caller (must be a civicship admin),
 * calls the `issueVc` GraphQL mutation against the dev API, then decodes
 * the resulting VC JWT and verifies its Ed25519 signature against the
 * public key the dev API publishes at `/.well-known/did.json`.
 *
 * What this proves
 * ----------------
 *   1. The full live signing path runs end-to-end:
 *        Apollo resolver
 *          → VcIssuanceUseCase
 *            → VcIssuanceService
 *              → KmsJwtSigner.prepare()        (DB findActiveKey)
 *              → KmsJwtSigner.sign(input)      (Cloud KMS Ed25519)
 *      → returns a JWT whose third segment is a real 64-byte
 *        Ed25519 signature, NOT `STUB_SIGNATURE`.
 *   2. The `kid` stamped in the header matches the verificationMethod
 *      currently advertised in the public DID Document.
 *   3. The signature verifies against the JWK published there — i.e.
 *      KMS, `t_issuer_did_keys`, and `/.well-known/did.json` agree on
 *      the same key.
 *
 * Required env (loaded from `.env.dev` via dotenvx):
 *   FIREBASE_PROJECT_ID
 *   FIREBASE_CLIENT_EMAIL
 *   FIREBASE_PRIVATE_KEY
 *   FIREBASE_TOKEN_API_KEY      (Web API Key for token exchange)
 *   FIREBASE_AUTH_TENANT_ID     (optional — set if tenant-scoped auth)
 *
 * Required flags:
 *   --uid=<firebase-uid>         Firebase UID of an admin caller.
 *                                Must already exist on the dev Firebase project
 *                                and map to a civicship Identity row.
 *   --user-id=<civicship-id>     VC subject (`User.id`, cuid).
 *
 * Optional flags:
 *   --evaluation-id=<id>         Tie the VC to an Evaluation row.
 *   --subject-did=<did>          Override; default = did:web:api.civicship.app:users:<user-id>
 *   --claims='{"k":"v"}'         JSON string for the VC claims object (default {}).
 *   --api=<url>                  GraphQL endpoint root. Defaults to dev API.
 *
 * Exit codes: 0 = PASS, 1 = FAIL.
 *
 * Usage:
 *   pnpm exec dotenvx run -f .env.dev -- pnpm exec tsx scripts/dev-issue-vc.ts \
 *     --uid=abc123 --user-id=clxyz... --evaluation-id=clabc...
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.2.2  (VC issuance)
 *   docs/report/did-vc-internalization.md §5.4.3  (Issuer DID + KMS)
 *   docs/report/did-vc-internalization.md §16     (Phase 2 KMS swap)
 */

import "reflect-metadata";

import admin from "firebase-admin";
import * as CSL from "@emurgo/cardano-serialization-lib-nodejs";

import { runStep } from "./lib/cardanoScriptHelpers.ts";

const DEFAULT_API = "https://kyoso-dev-civicship-api-erfss3pm6a-uc.a.run.app";
const SUBJECT_DID_PREFIX = "did:web:api.civicship.app:users:";

interface Flags {
  uid: string;
  userId: string;
  evaluationId?: string;
  subjectDid: string;
  claims: Record<string, unknown>;
  api: string;
  communityId: string;
}

function parseFlags(argv: string[]): Flags {
  const map = new Map<string, string>();
  for (const arg of argv) {
    const match = /^--([\w-]+)=(.+)$/s.exec(arg);
    if (!match) throw new Error(`Unrecognised arg: ${arg}`);
    map.set(match[1], match[2]);
  }
  const uid = map.get("uid");
  const userId = map.get("user-id");
  const communityId = map.get("community-id");
  if (!uid) throw new Error("--uid=<firebase-uid> is required");
  if (!userId) throw new Error("--user-id=<civicship user.id> is required");
  if (!communityId) {
    throw new Error(
      "--community-id=<civicship Community.id> is required " +
        "(the API enforces `x-community-id` on authenticated requests, " +
        "since callers may belong to multiple communities).",
    );
  }

  const claimsRaw = map.get("claims") ?? "{}";
  let claims: Record<string, unknown>;
  try {
    claims = JSON.parse(claimsRaw);
  } catch {
    throw new Error(`--claims must be valid JSON, got: ${claimsRaw}`);
  }

  return {
    uid,
    userId,
    evaluationId: map.get("evaluation-id"),
    subjectDid: map.get("subject-did") ?? `${SUBJECT_DID_PREFIX}${userId}`,
    claims,
    api: map.get("api") ?? DEFAULT_API,
    communityId,
  };
}

interface FirebaseAdminEnv {
  projectId: string;
  clientEmail: string;
  privateKey: string;
  webApiKey: string;
  tenantId?: string;
}

function requireFirebaseAdminEnv(): FirebaseAdminEnv {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // `replace(/\\n/g, "\n")` mirrors how `jest.setup.ts` unescapes the
  // newline-escaped PEM body when it lives in a single env var line.
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const webApiKey = process.env.FIREBASE_TOKEN_API_KEY;
  const tenantId = process.env.FIREBASE_AUTH_TENANT_ID;

  if (!projectId || !clientEmail || !privateKey || !webApiKey) {
    const missing = (
      [
        ["FIREBASE_PROJECT_ID", projectId],
        ["FIREBASE_CLIENT_EMAIL", clientEmail],
        ["FIREBASE_PRIVATE_KEY", privateKey],
        ["FIREBASE_TOKEN_API_KEY", webApiKey],
      ] as const
    )
      .filter(([, v]) => !v)
      .map(([k]) => k)
      .join(", ");
    throw new Error(`Missing required Firebase env: ${missing}`);
  }
  return { projectId, clientEmail, privateKey, webApiKey, tenantId };
}

function initFirebaseAdmin(env: FirebaseAdminEnv): void {
  if (admin.apps.length > 0) return;
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.projectId,
      clientEmail: env.clientEmail,
      privateKey: env.privateKey,
    }),
  });
}

async function mintCustomToken(uid: string, tenantId?: string): Promise<string> {
  // `admin.auth().tenantManager().authForTenant()` returns a TenantAwareAuth
  // instance that mints tokens scoped to the given tenant. Without the
  // tenant wrapper the token is rejected by Identity Toolkit when the
  // project enforces multi-tenancy.
  if (tenantId) {
    return admin.auth().tenantManager().authForTenant(tenantId).createCustomToken(uid);
  }
  return admin.auth().createCustomToken(uid);
}

async function exchangeCustomTokenForIdToken(
  customToken: string,
  webApiKey: string,
  tenantId?: string,
): Promise<string> {
  // Identity Toolkit v1 — the public endpoint that every Firebase SDK
  // ultimately hits to redeem a custom token for an ID token. We bypass
  // the SDK so the script has zero runtime dependency on the (browser-
  // oriented) `firebase` package.
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${webApiKey}`;
  const body: Record<string, unknown> = {
    token: customToken,
    returnSecureToken: true,
  };
  if (tenantId) body.tenantId = tenantId;

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Identity Toolkit ${resp.status}: ${text}`);
  }
  const json = (await resp.json()) as { idToken?: string };
  if (!json.idToken) {
    throw new Error(`Identity Toolkit response missing idToken: ${JSON.stringify(json)}`);
  }
  return json.idToken;
}

interface IssueVcResponse {
  vcJwt: string;
  id: string;
}

async function callIssueVc(
  api: string,
  idToken: string,
  flags: Flags,
): Promise<IssueVcResponse> {
  const query = `
    mutation IssueVcDevPoC($input: IssueVcInput!) {
      issueVc(input: $input) {
        id
        vcJwt
      }
    }
  `;
  const variables = {
    input: {
      userId: flags.userId,
      evaluationId: flags.evaluationId ?? null,
      subjectDid: flags.subjectDid,
      claims: flags.claims,
    },
  };
  const resp = await fetch(`${api.replace(/\/$/, "")}/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
      // The auth middleware rejects authenticated calls without an explicit
      // community context — callers may sit in multiple communities so the
      // server cannot infer one. Mirror the same header the frontend sends.
      "x-community-id": flags.communityId,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`GraphQL HTTP ${resp.status}: ${text}`);
  }
  const json = (await resp.json()) as {
    data?: { issueVc?: IssueVcResponse };
    errors?: ReadonlyArray<{ message: string; extensions?: unknown }>;
  };
  if (json.errors && json.errors.length > 0) {
    throw new Error(`GraphQL errors: ${JSON.stringify(json.errors, null, 2)}`);
  }
  if (!json.data?.issueVc?.vcJwt) {
    throw new Error(`GraphQL response missing issueVc.vcJwt: ${JSON.stringify(json)}`);
  }
  return json.data.issueVc;
}

interface JwtParts {
  headerJson: Record<string, unknown>;
  payloadJson: Record<string, unknown>;
  signingInputBytes: Uint8Array;
  signatureBytes: Uint8Array;
}

function decodeJwt(jwt: string): JwtParts {
  const segments = jwt.split(".");
  if (segments.length !== 3) {
    throw new Error(`JWT must have 3 segments, got ${segments.length}`);
  }
  const [headerB64u, payloadB64u, sigB64u] = segments;
  const headerJson = JSON.parse(Buffer.from(headerB64u, "base64url").toString("utf8")) as Record<
    string,
    unknown
  >;
  const payloadJson = JSON.parse(Buffer.from(payloadB64u, "base64url").toString("utf8")) as Record<
    string,
    unknown
  >;
  // `${header}.${payload}` is the exact byte sequence the signer signed.
  // Re-encode from the original ASCII bytes (no JSON round-trip) so any
  // canonicalisation drift surfaces here, not later.
  const signingInputBytes = new TextEncoder().encode(`${headerB64u}.${payloadB64u}`);
  const signatureBytes = new Uint8Array(Buffer.from(sigB64u, "base64url"));
  return { headerJson, payloadJson, signingInputBytes, signatureBytes };
}

interface DidDocument {
  verificationMethod: ReadonlyArray<{
    id: string;
    type: string;
    publicKeyJwk?: { kty: string; crv: string; x: string };
  }>;
}

function pickEd25519PublicKey(doc: DidDocument, kid: string): Uint8Array {
  for (const vm of doc.verificationMethod) {
    if (vm.id !== kid) continue;
    if (vm.publicKeyJwk?.kty === "OKP" && vm.publicKeyJwk.crv === "Ed25519") {
      const bytes = new Uint8Array(Buffer.from(vm.publicKeyJwk.x, "base64url"));
      if (bytes.length !== 32) {
        throw new Error(`publicKeyJwk.x is ${bytes.length} bytes, expected 32 (Ed25519)`);
      }
      return bytes;
    }
  }
  throw new Error(
    `verificationMethod ${kid} not found (or not an Ed25519 JWK) in DID Document. ` +
      "Likely the JWT header's `kid` no longer matches the published key set — " +
      "either an in-flight rotation or stale snapshot inside KmsJwtSigner.",
  );
}

async function main(): Promise<number> {
  const flags = parseFlags(process.argv.slice(2));
  process.stdout.write("Dev VC issuance end-to-end PoC (KmsJwtSigner)\n\n");

  // Step 1 — Firebase admin init
  const envStep = await runStep<FirebaseAdminEnv>("env: Firebase admin creds", async () => {
    const env = requireFirebaseAdminEnv();
    initFirebaseAdmin(env);
    return {
      value: env,
      detail: `projectId=${env.projectId}, tenant=${env.tenantId ?? "(none)"}`,
    };
  });
  if (!envStep.ok) return 1;
  const fbEnv = envStep.value;

  // Step 2 — custom token
  const customTokenStep = await runStep<string>("firebase: createCustomToken", async () => {
    const token = await mintCustomToken(flags.uid, fbEnv.tenantId);
    return { value: token, detail: `uid=${flags.uid}` };
  });
  if (!customTokenStep.ok) return 1;
  const customToken = customTokenStep.value;

  // Step 3 — ID token
  const idTokenStep = await runStep<string>(
    "firebase: exchange custom → ID token",
    async () => {
      const id = await exchangeCustomTokenForIdToken(customToken, fbEnv.webApiKey, fbEnv.tenantId);
      return { value: id, detail: `idToken len=${id.length}` };
    },
  );
  if (!idTokenStep.ok) return 1;
  const idToken = idTokenStep.value;

  // Step 4 — GraphQL issueVc
  const issueStep = await runStep<IssueVcResponse>("graphql: issueVc mutation", async () => {
    const res = await callIssueVc(flags.api, idToken, flags);
    return { value: res, detail: `vcIssuance.id=${res.id}, vcJwt len=${res.vcJwt.length}` };
  });
  if (!issueStep.ok) return 1;
  const issued = issueStep.value;

  // Step 5 — decode JWT
  const decodeStep = await runStep<JwtParts>("jwt: decode + sanity check", async () => {
    const parts = decodeJwt(issued.vcJwt);
    if (parts.headerJson.alg !== "EdDSA") {
      throw new Error(`header.alg = ${String(parts.headerJson.alg)}, expected "EdDSA"`);
    }
    if (typeof parts.headerJson.kid !== "string") {
      throw new Error("header.kid missing or not a string");
    }
    if (parts.signatureBytes.length !== 64) {
      throw new Error(
        `signature is ${parts.signatureBytes.length} bytes, expected 64 (raw Ed25519). ` +
          "If this is the stub marker, KmsJwtSigner is not wired against `VcJwtSigner`.",
      );
    }
    return {
      value: parts,
      detail: `alg=${String(parts.headerJson.alg)}, kid=${String(parts.headerJson.kid)}`,
    };
  });
  if (!decodeStep.ok) return 1;
  const { headerJson, signingInputBytes, signatureBytes } = decodeStep.value;
  const kid = headerJson.kid as string;

  // Step 6 — fetch DID Document
  const didStep = await runStep<Uint8Array>(`fetch: ${flags.api}/.well-known/did.json`, async () => {
    const resp = await fetch(`${flags.api.replace(/\/$/, "")}/.well-known/did.json`);
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status} ${resp.statusText}`);
    }
    const doc = (await resp.json()) as DidDocument;
    const pub = pickEd25519PublicKey(doc, kid);
    return { value: pub, detail: `kid=${kid}, pubkey(hex)=${Buffer.from(pub).toString("hex")}` };
  });
  if (!didStep.ok) return 1;
  const publicKey = didStep.value;

  // Step 7 — verify
  const verifyStep = await runStep("verify: Ed25519 sig over header.payload", async () => {
    const pub = CSL.PublicKey.from_bytes(publicKey);
    const sig = CSL.Ed25519Signature.from_bytes(signatureBytes);
    const ok = pub.verify(signingInputBytes, sig);
    if (!ok) {
      throw new Error(
        "signature does NOT verify against DID Document public key. " +
          "KMS, `t_issuer_did_keys`, and the published DID are out of sync.",
      );
    }
    return { value: undefined, detail: `vcId=${issued.id}` };
  });
  if (!verifyStep.ok) return 1;

  process.stdout.write("\nALL STEPS PASSED.\n");
  process.stdout.write(
    "issueVc → KmsJwtSigner → real Ed25519 sig → verified against /.well-known/did.json\n",
  );
  return 0;
}

main()
  .then((code) => process.exit(code))
  .catch((err: unknown) => {
    process.stderr.write(`ERROR: ${err instanceof Error ? (err.stack ?? err.message) : String(err)}\n`);
    process.exit(1);
  });
