#!/usr/bin/env -S node --experimental-strip-types
/**
 * Third-party verification script for civicship DID / VC anchors.
 *
 * Design reference: docs/report/did-vc-internalization.md
 *   - Appendix B.2 (audit verification: HTTPS + chain)
 *   - Appendix B.3 (chain-only verification)
 *   - §5.1.7 (Merkle tree canonical encoding)
 *   - §5.4.4 (DID Document proof block)
 *   - §5.4.6 (`/vc/:vcId/inclusion-proof` shape)
 *   - §5.1.6 (metadata label 1985 structure)
 *   - §8 (DID operations on chain)
 *
 * Civicship-non-dependent: this script lives outside `src/` and references
 * **no civicship-api code**. It only depends on:
 *   - Node 22+ global `fetch`
 *   - `@noble/hashes` for Blake2b-256 (Cardano-native hash)
 *
 * Cardano access is via the public **Koios** REST API (no Blockfrost, no API key).
 *
 * Usage:
 *   node --experimental-strip-types scripts/verify-from-chain.ts \
 *     --did did:web:api.civicship.app:users:u_xyz
 *
 *   node --experimental-strip-types scripts/verify-from-chain.ts --vc <vcId>
 *
 * Optional flags:
 *   --base-url   override the civicship-api base URL (default https://api.civicship.app)
 *   --koios-url  override Koios base URL          (default https://api.koios.rest/api/v1)
 *   --network    cardano network for explorer URL (default mainnet)
 *
 * Exit codes: 0 = PASS, 1 = FAIL, 2 = INPUT_ERROR
 */

import { blake2b } from "@noble/hashes/blake2b";

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

type DidProof = {
  type: string;
  cryptosuite: string;
  anchorChain: string;
  anchorTxHash: string | null;
  opIndexInTx: number | null;
  docHash: string;
  anchorStatus: "pending" | "submitted" | "confirmed" | "failed";
  anchoredAt?: string | null;
  verificationUrl?: string | null;
};

type DidDocument = {
  "@context"?: unknown;
  id: string;
  proof?: DidProof;
};

type InclusionProofResponse = {
  vcId: string;
  leafHash: string; // hex, 64 chars
  leafIndex: number;
  siblings: string[]; // hex, 64 chars each
  root: string; // hex
  chainTxHash: string; // hex tx id (64 chars)
};

/**
 * Koios `tx_metadata` row. `json_metadata` is the decoded metadata for the
 * label, structured exactly as it was stored by the issuer (§5.1.6).
 *
 * Reference: https://api.koios.rest/#post-/tx_metadata
 */
type KoiosTxMetadataRow = {
  tx_hash: string;
  metadata: Record<string, unknown> | null;
};

type Metadata1985 = {
  v: number;
  bid?: string;
  ts?: number;
  tx?: { root: string; count: number };
  vc?: { root: string; count: number };
  ops?: Array<{
    k: "c" | "u" | "d";
    did: string;
    h?: string;
    doc?: string | string[]; // bytes or chunked bytes (hex-encoded when JSON)
    prev?: string | null;
  }>;
};

// ----------------------------------------------------------------------------
// CLI parsing
// ----------------------------------------------------------------------------

type Args = {
  did?: string;
  vc?: string;
  baseUrl: string;
  koiosUrl: string;
  network: string;
  help: boolean;
};

/**
 * Strip trailing `/` characters from a URL without using a regex.
 *
 * Linear-time, no backtracking. Replaces the earlier `.replace(/\/+$/, "")`
 * which SonarCloud flagged as `typescript:S5852` (slow regex / DoS hotspot);
 * even though that anchored pattern is provably linear, avoiding the regex
 * altogether is simpler and side-steps the rule entirely.
 */
function stripTrailingSlash(s: string): string {
  let end = s.length;
  while (end > 0 && s.charCodeAt(end - 1) === 47 /* '/' */) end--;
  return s.substring(0, end);
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    baseUrl: "https://api.civicship.app",
    koiosUrl: "https://api.koios.rest/api/v1",
    network: "mainnet",
    help: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => {
      const v = argv[i + 1];
      if (v === undefined) throw new Error(`Missing value for ${a}`);
      i++;
      return v;
    };
    switch (a) {
      case "--did":
        args.did = next();
        break;
      case "--vc":
        args.vc = next();
        break;
      case "--base-url":
        args.baseUrl = stripTrailingSlash(next());
        break;
      case "--koios-url":
        args.koiosUrl = stripTrailingSlash(next());
        break;
      case "--network":
        args.network = next();
        break;
      case "-h":
      case "--help":
        args.help = true;
        break;
      default:
        throw new Error(`Unknown argument: ${a}`);
    }
  }
  return args;
}

function printHelp(): void {
  process.stdout.write(
    [
      "verify-from-chain.ts — Third-party verifier for civicship DID/VC anchors",
      "",
      "Usage:",
      "  verify-from-chain.ts --did <did>",
      "  verify-from-chain.ts --vc  <vcId>",
      "",
      "Options:",
      "  --base-url   civicship-api base URL  (default: https://api.civicship.app)",
      "  --koios-url  Koios REST endpoint     (default: https://api.koios.rest/api/v1)",
      "  --network    cardano network         (default: mainnet)",
      "  -h, --help   show this help",
      "",
    ].join("\n"),
  );
}

// ----------------------------------------------------------------------------
// Hex / hash helpers (Cardano-native Blake2b-256)
// ----------------------------------------------------------------------------

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (clean.length % 2 !== 0) throw new Error(`invalid hex length: ${hex}`);
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    const byte = clean.slice(i * 2, i * 2 + 2);
    const v = parseInt(byte, 16);
    if (Number.isNaN(v)) throw new Error(`invalid hex char in: ${hex}`);
    out[i] = v;
  }
  return out;
}

function bytesToHex(b: Uint8Array): string {
  let s = "";
  for (let i = 0; i < b.length; i++) s += b[i].toString(16).padStart(2, "0");
  return s;
}

function concatBytes(a: Uint8Array, b: Uint8Array): Uint8Array {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}

function hashPair(a: Uint8Array, b: Uint8Array): Uint8Array {
  // §5.1.7: internal node = Blake2b-256(left_bytes || right_bytes), 32-byte raw concat
  return blake2b(concatBytes(a, b), { dkLen: 32 });
}

// ----------------------------------------------------------------------------
// Merkle proof verification (§5.1.7)
//
// civicship Merkle tree uses the **duplicate-last** odd-leaf rule, matching
// `src/infrastructure/libs/merkle/merkleTreeBuilder.ts` (`buildRoot` /
// `getProof`): when a layer has an odd number of nodes, the last node is
// hashed with itself — `hashPair(last, last)`. Note that `@openzeppelin/
// merkle-tree` JS uses a *carry-up* promotion instead; we deliberately
// diverge from that for a simpler verifier loop where every level always has
// one sibling.
//
// Consequence: `siblings.length === ceil(log2(n))` exactly. The loop below
// walks one sibling per level without skipping; at the position whose
// sibling was self-duplicated, the server returns that same node and
// `hashPair(cur, cur)` reproduces the parent.
//
// At each level, pairing position is decided by `cursor % 2`:
//   - even (LEFT)  → sibling is RIGHT → hashPair(cur, sib)
//   - odd  (RIGHT) → sibling is LEFT  → hashPair(sib, cur)
// ----------------------------------------------------------------------------

function verifyMerkleProof(
  leafHash: Uint8Array,
  leafIndex: number,
  siblings: Uint8Array[],
): Uint8Array {
  let cur = leafHash;
  let idx = leafIndex;
  for (const sib of siblings) {
    if ((idx & 1) === 0) {
      cur = hashPair(cur, sib);
    } else {
      cur = hashPair(sib, cur);
    }
    idx = idx >>> 1;
  }
  return cur;
}

// ----------------------------------------------------------------------------
// HTTPS fetchers
// ----------------------------------------------------------------------------

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}: ${body}`);
  }
  return (await res.json()) as T;
}

/**
 * Resolve `did:web:host[:path...]` → HTTPS URL per W3C did:web spec.
 *   did:web:api.civicship.app                  → https://api.civicship.app/.well-known/did.json
 *   did:web:api.civicship.app:users:u_xyz      → https://api.civicship.app/users/u_xyz/did.json
 */
function didWebToUrl(did: string): string {
  if (!did.startsWith("did:web:")) {
    throw new Error(`not a did:web DID: ${did}`);
  }
  const parts = did.slice("did:web:".length).split(":").map(decodeURIComponent);
  const host = parts[0];
  if (!host) throw new Error(`invalid did:web (missing host): ${did}`);
  if (parts.length === 1) {
    return `https://${host}/.well-known/did.json`;
  }
  const path = parts.slice(1).join("/");
  return `https://${host}/${path}/did.json`;
}

/**
 * Fetch Cardano transaction metadata via Koios.
 *
 * Koios endpoint: POST /tx_metadata { "_tx_hashes": ["<hex>"] }
 * Returns: [{ tx_hash, metadata: { "<label>": <decoded JSON> } | null }]
 *
 * Note: Koios returns metadata already decoded to JSON, with label keys as
 * strings ("1985"). The shape mirrors the issuer-side metadata structure
 * (§5.1.6) one-to-one for our purposes, except `doc` bytes appear as hex
 * strings (Koios convention for `bytes` CBOR types).
 */
async function fetchTxMetadata(
  koiosUrl: string,
  txHash: string,
): Promise<Metadata1985 | null> {
  const url = `${koiosUrl}/tx_metadata`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ _tx_hashes: [txHash] }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Koios HTTP ${res.status} for ${url}: ${body}`);
  }
  const rows = (await res.json()) as KoiosTxMetadataRow[];
  const row = rows.find((r) => r.tx_hash === txHash);
  if (!row || !row.metadata) return null;
  const labelEntry = row.metadata["1985"];
  if (labelEntry === undefined) return null;
  return labelEntry as Metadata1985;
}

// ----------------------------------------------------------------------------
// Result reporter
// ----------------------------------------------------------------------------

type VerificationResult = {
  ok: boolean;
  subject: string;
  reasons: string[];
  details: Record<string, unknown>;
};

function explorerTxUrl(network: string, txHash: string): string {
  // cardanoscan.io supports both mainnet and preprod (e.g. preprod.cardanoscan.io)
  const host =
    network === "mainnet" ? "cardanoscan.io" : `${network}.cardanoscan.io`;
  return `https://${host}/transaction/${txHash}`;
}

function report(network: string, r: VerificationResult): void {
  const verdict = r.ok ? "PASS" : "FAIL";
  process.stdout.write(`\n[${verdict}] ${r.subject}\n`);
  for (const reason of r.reasons) {
    process.stdout.write(`  - ${reason}\n`);
  }
  if (r.details.chainTxHash) {
    process.stdout.write(
      `  explorer: ${explorerTxUrl(network, String(r.details.chainTxHash))}\n`,
    );
  }
  if (Object.keys(r.details).length > 0) {
    process.stdout.write(
      `  details: ${JSON.stringify(r.details, null, 2)}\n`,
    );
  }
}

// ----------------------------------------------------------------------------
// DID verification (Appendix B.2 step 7-8)
// ----------------------------------------------------------------------------

async function verifyDid(
  did: string,
  baseUrl: string,
  koiosUrl: string,
): Promise<VerificationResult> {
  const reasons: string[] = [];
  const details: Record<string, unknown> = { did };

  // Step 1: HTTPS GET DID Document.
  // For did:web, baseUrl is ignored in favor of the URL derived from the DID
  // string itself (this is the standard did:web resolution).
  // baseUrl is kept available for ad-hoc overrides.
  let didDocUrl: string;
  try {
    didDocUrl = didWebToUrl(did);
  } catch (e) {
    return {
      ok: false,
      subject: did,
      reasons: [(e as Error).message],
      details,
    };
  }
  if (baseUrl && !didDocUrl.startsWith(baseUrl)) {
    // Allow forcing a custom origin (e.g. localhost during tests). We only
    // swap origin, preserving path.
    const path = new URL(didDocUrl).pathname;
    didDocUrl = `${baseUrl}${path}`;
  }
  reasons.push(`fetched DID Document from ${didDocUrl}`);
  let doc: DidDocument;
  try {
    doc = await fetchJson<DidDocument>(didDocUrl);
  } catch (e) {
    return {
      ok: false,
      subject: did,
      reasons: [...reasons, `DID Document fetch failed: ${(e as Error).message}`],
      details,
    };
  }

  if (doc.id !== did) {
    return {
      ok: false,
      subject: did,
      reasons: [
        ...reasons,
        `DID Document id mismatch: doc.id=${doc.id} != requested=${did}`,
      ],
      details: { ...details, document: doc },
    };
  }
  const proof = doc.proof;
  if (!proof) {
    return {
      ok: false,
      subject: did,
      reasons: [...reasons, "DID Document has no proof block"],
      details: { ...details, document: doc },
    };
  }
  details.proof = proof;

  if (proof.anchorStatus !== "confirmed") {
    // Per §5.4.4: PENDING / SUBMITTED states are valid HTTPS responses but
    // cannot be cross-checked against chain yet. We surface this as a
    // verifier-decided outcome rather than a hard FAIL.
    return {
      ok: false,
      subject: did,
      reasons: [
        ...reasons,
        `DID anchor status is "${proof.anchorStatus}" — chain integrity not yet verifiable`,
      ],
      details,
    };
  }
  if (!proof.anchorTxHash || proof.opIndexInTx == null) {
    return {
      ok: false,
      subject: did,
      reasons: [
        ...reasons,
        "DID proof is missing anchorTxHash / opIndexInTx despite confirmed status",
      ],
      details,
    };
  }

  // Step 2: pull tx metadata 1985 from Koios.
  reasons.push(`fetching Cardano tx metadata 1985 (tx=${proof.anchorTxHash})`);
  let meta: Metadata1985 | null;
  try {
    meta = await fetchTxMetadata(koiosUrl, proof.anchorTxHash);
  } catch (e) {
    return {
      ok: false,
      subject: did,
      reasons: [...reasons, `Koios metadata fetch failed: ${(e as Error).message}`],
      details: { ...details, chainTxHash: proof.anchorTxHash },
    };
  }
  if (!meta) {
    return {
      ok: false,
      subject: did,
      reasons: [
        ...reasons,
        `tx ${proof.anchorTxHash} has no metadata under label 1985`,
      ],
      details: { ...details, chainTxHash: proof.anchorTxHash },
    };
  }
  details.chainTxHash = proof.anchorTxHash;
  details.metadataVersion = meta.v;

  // Step 3: locate ops[opIndexInTx] and compare doc hash.
  if (!Array.isArray(meta.ops) || meta.ops.length <= proof.opIndexInTx) {
    return {
      ok: false,
      subject: did,
      reasons: [
        ...reasons,
        `ops[${proof.opIndexInTx}] missing from metadata (ops.length=${
          Array.isArray(meta.ops) ? meta.ops.length : 0
        })`,
      ],
      details,
    };
  }
  const op = meta.ops[proof.opIndexInTx];
  if (op.did !== did) {
    return {
      ok: false,
      subject: did,
      reasons: [
        ...reasons,
        `ops[${proof.opIndexInTx}].did=${op.did} != requested DID=${did}`,
      ],
      details: { ...details, op },
    };
  }
  if (op.k === "d") {
    // DEACTIVATE: §8.1 — `h` may be absent. The DID is intentionally revoked.
    reasons.push("on-chain op is DEACTIVATE — DID is intentionally revoked");
    return {
      ok: false,
      subject: did,
      reasons,
      details: { ...details, op },
    };
  }
  if (!op.h) {
    return {
      ok: false,
      subject: did,
      reasons: [...reasons, `ops[${proof.opIndexInTx}] has no doc hash (h)`],
      details: { ...details, op },
    };
  }
  if (op.h.toLowerCase() !== proof.docHash.toLowerCase()) {
    return {
      ok: false,
      subject: did,
      reasons: [
        ...reasons,
        `doc hash mismatch: chain=${op.h} != proof.docHash=${proof.docHash}`,
      ],
      details: { ...details, op },
    };
  }
  reasons.push(`doc hash matches on-chain ops[${proof.opIndexInTx}].h`);
  return {
    ok: true,
    subject: did,
    reasons,
    details,
  };
}

// ----------------------------------------------------------------------------
// VC verification (Appendix B.2 step 9)
// ----------------------------------------------------------------------------

async function verifyVc(
  vcId: string,
  baseUrl: string,
  koiosUrl: string,
): Promise<VerificationResult> {
  const reasons: string[] = [];
  const details: Record<string, unknown> = { vcId };

  const url = `${baseUrl}/vc/${encodeURIComponent(vcId)}/inclusion-proof`;
  reasons.push(`fetched inclusion proof from ${url}`);
  let proof: InclusionProofResponse;
  try {
    proof = await fetchJson<InclusionProofResponse>(url);
  } catch (e) {
    return {
      ok: false,
      subject: vcId,
      reasons: [...reasons, `inclusion-proof fetch failed: ${(e as Error).message}`],
      details,
    };
  }

  // Step 1: locally reconstruct Merkle root from leafHash + siblings.
  let computed: Uint8Array;
  try {
    const leaf = hexToBytes(proof.leafHash);
    const sibs = proof.siblings.map(hexToBytes);
    computed = verifyMerkleProof(leaf, proof.leafIndex, sibs);
  } catch (e) {
    return {
      ok: false,
      subject: vcId,
      reasons: [...reasons, `merkle proof decode failed: ${(e as Error).message}`],
      details: { ...details, proof },
    };
  }
  const computedHex = bytesToHex(computed);
  details.computedRoot = computedHex;
  details.apiRoot = proof.root;

  if (computedHex.toLowerCase() !== proof.root.toLowerCase()) {
    return {
      ok: false,
      subject: vcId,
      reasons: [
        ...reasons,
        `locally computed root ${computedHex} != API root ${proof.root}`,
      ],
      details,
    };
  }
  reasons.push("locally computed Merkle root matches API-returned root");

  // Step 2: fetch on-chain metadata.vc.root and compare.
  reasons.push(`fetching Cardano tx metadata 1985 (tx=${proof.chainTxHash})`);
  let meta: Metadata1985 | null;
  try {
    meta = await fetchTxMetadata(koiosUrl, proof.chainTxHash);
  } catch (e) {
    return {
      ok: false,
      subject: vcId,
      reasons: [...reasons, `Koios metadata fetch failed: ${(e as Error).message}`],
      details: { ...details, chainTxHash: proof.chainTxHash },
    };
  }
  details.chainTxHash = proof.chainTxHash;
  if (!meta || !meta.vc?.root) {
    return {
      ok: false,
      subject: vcId,
      reasons: [
        ...reasons,
        `tx ${proof.chainTxHash} has no vc.root in metadata 1985`,
      ],
      details,
    };
  }
  details.chainVcRoot = meta.vc.root;

  if (meta.vc.root.toLowerCase() !== computedHex.toLowerCase()) {
    return {
      ok: false,
      subject: vcId,
      reasons: [
        ...reasons,
        `on-chain vc.root ${meta.vc.root} != locally computed ${computedHex}`,
      ],
      details,
    };
  }
  reasons.push("on-chain vc.root matches locally computed Merkle root");
  return {
    ok: true,
    subject: vcId,
    reasons,
    details,
  };
}

// ----------------------------------------------------------------------------
// Entrypoint
// ----------------------------------------------------------------------------

async function main(): Promise<number> {
  let args: Args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (e) {
    process.stderr.write(`Argument error: ${(e as Error).message}\n`);
    printHelp();
    return 2;
  }
  if (args.help || (!args.did && !args.vc)) {
    printHelp();
    return args.help ? 0 : 2;
  }
  if (args.did && args.vc) {
    process.stderr.write("Specify exactly one of --did or --vc, not both.\n");
    return 2;
  }

  if (args.did) {
    const r = await verifyDid(args.did, args.baseUrl, args.koiosUrl);
    report(args.network, r);
    return r.ok ? 0 : 1;
  }

  // args.vc is set (mutually exclusive with did)
  const r = await verifyVc(args.vc as string, args.baseUrl, args.koiosUrl);
  report(args.network, r);
  return r.ok ? 0 : 1;
}

main().then(
  (code) => process.exit(code),
  (err) => {
    process.stderr.write(`Unhandled error: ${(err as Error).stack ?? err}\n`);
    process.exit(1);
  },
);
