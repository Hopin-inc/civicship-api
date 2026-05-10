/**
 * `did:web:api.civicship.app` builder for the civicship Issuer DID.
 *
 * Civicship issues every internal VC (`VcFormat.INTERNAL_JWT`) under a single
 * platform DID. Unlike per-user DIDs (`§5.1.3 userDidBuilder.ts`), the Issuer
 * DID Document MUST carry a `verificationMethod` so verifiers can resolve a
 * VC's `iss` to a public key and verify the JWT signature.
 *
 * This file is the pure-data layer:
 *   - no I/O, no DB, no DI, no `KmsSigner` calls
 *   - takes the KMS resource name and a raw 32-byte Ed25519 public key, hex
 *   - returns a fully-formed JSON object that can be served verbatim from
 *     `/.well-known/did.json` (design §5.4.1)
 *
 * The async fetching/caching layer that *calls* the KMS and supplies the
 * public-key hex lives in `IssuerDidService` (design §5.4.3, future PR).
 *
 * Why `publicKeyMultibase` (not `publicKeyJwk`)?
 *   The W3C Ed25519 Signature 2020 / Multikey suite is the recommended form
 *   for Ed25519 verification methods (DID Spec Registries). Multibase encoding
 *   keeps the document compact (Cardano metadata 16 KB ceiling, design §5.1.6)
 *   and avoids base64url JWK ambiguity. Format:
 *     `z` (multibase prefix for base58btc)
 *     + base58btc(varint multicodec 0xed01 || raw 32-byte Ed25519 pubkey)
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.1.2 (this builder)
 *   docs/report/did-vc-internalization.md §3.3   (hybrid DID resolve)
 *   docs/report/did-vc-internalization.md §5.4.1 (`/.well-known/did.json` shape)
 *   W3C did:web https://w3c-ccg.github.io/did-method-web/
 *   W3C Multikey https://www.w3.org/TR/cid-1.0/#Multikey
 *   Multicodec 0xed Ed25519-pub https://github.com/multiformats/multicodec/blob/master/table.csv
 */

/** The civicship Issuer DID. Only one DID, hard-coded by host. */
export const CIVICSHIP_ISSUER_DID = "did:web:api.civicship.app";

/** VC type civicship issues for verified attendance / participation events. */
export const CIVICSHIP_ATTENDANCE_VC_TYPE = "civicship-attendance-credential-2026";

/** Multicodec varint prefix for raw Ed25519 public keys (0xed → 0xed01). */
const ED25519_PUB_MULTICODEC = new Uint8Array([0xed, 0x01]);

export interface IssuerVerificationMethod {
  id: string;
  type: "Multikey";
  controller: string;
  publicKeyMultibase: string;
}

export interface IssuerService {
  id: string;
  type: string;
  serviceEndpoint: string | { credentialTypes: readonly string[] };
}

export interface IssuerDidDocument {
  "@context": readonly string[];
  id: string;
  verificationMethod: readonly IssuerVerificationMethod[];
  assertionMethod: readonly string[];
  authentication: readonly string[];
  service: readonly IssuerService[];
}

/**
 * Return the canonical Issuer DID. Argument-less by design: civicship has
 * exactly one Issuer DID and it is bound to the API host.
 */
export function buildIssuerDid(): string {
  return CIVICSHIP_ISSUER_DID;
}

export interface BuildIssuerDidDocumentParams {
  /**
   * Full KMS resource name including `cryptoKeyVersions/N`. Used to derive
   * a stable `#fragment` for the verificationMethod id so verifiers can
   * uniquely reference a specific key version (design §G key rotation).
   */
  kmsKeyResourceName: string;
  /** Raw 32-byte Ed25519 public key, lowercase hex (no `0x` prefix). */
  publicKeyEd25519Hex: string;
}

/**
 * Build the full Issuer DID Document for `did:web:api.civicship.app`.
 *
 * Single-key shape: this PR covers the steady-state document. The
 * key-rotation overlap shape (multiple keys in one document, design §G) is
 * built on top of this in `IssuerDidService.buildDidDocument()` by mapping
 * over each active key.
 */
export function buildIssuerDidDocument(params: BuildIssuerDidDocumentParams): IssuerDidDocument {
  const { kmsKeyResourceName, publicKeyEd25519Hex } = params;

  const pubBytes = hexToBytes(publicKeyEd25519Hex);
  if (pubBytes.length !== 32) {
    throw new Error(
      `Ed25519 public key must be 32 bytes, got ${pubBytes.length} ` +
        "(design §5.1.2). Pass the raw public key, not SPKI / JWK.",
    );
  }
  const fragment = keyVersionToFragment(kmsKeyResourceName);
  const did = CIVICSHIP_ISSUER_DID;
  const vmId = `${did}#${fragment}`;

  const publicKeyMultibase = encodeMultikeyEd25519(pubBytes);

  return {
    "@context": ["https://www.w3.org/ns/did/v1", "https://w3id.org/security/multikey/v1"],
    id: did,
    verificationMethod: [
      {
        id: vmId,
        type: "Multikey",
        controller: did,
        publicKeyMultibase,
      },
    ],
    assertionMethod: [vmId],
    authentication: [vmId],
    service: [
      {
        id: `${did}#issued-credentials`,
        type: "CivicshipIssuedCredentials",
        serviceEndpoint: {
          credentialTypes: [CIVICSHIP_ATTENDANCE_VC_TYPE],
        },
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Encoding helpers — exported for unit-testability of the multibase round-trip
// ---------------------------------------------------------------------------

/**
 * Encode raw Ed25519 public-key bytes as a W3C Multikey publicKeyMultibase.
 * Format: `z` + base58btc(0xed 0x01 || rawPubkey).
 *
 * Hand-rolled base58btc encoder: the algorithm is small (~30 lines), avoids
 * pulling in the ESM-only `multiformats` package (which trips ts-jest's CJS
 * transform), and round-trips against `multiformats` in the unit tests.
 */
export function encodeMultikeyEd25519(rawPubKey: Uint8Array): string {
  if (rawPubKey.length !== 32) {
    throw new Error(`Ed25519 public key must be 32 bytes, got ${rawPubKey.length}`);
  }
  const prefixed = new Uint8Array(ED25519_PUB_MULTICODEC.length + rawPubKey.length);
  prefixed.set(ED25519_PUB_MULTICODEC, 0);
  prefixed.set(rawPubKey, ED25519_PUB_MULTICODEC.length);
  return "z" + base58btcEncode(prefixed);
}

const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/**
 * Bitcoin / IPFS base58 encoder (no leading `z` — caller adds the multibase
 * prefix). Implementation follows the standard "BigInteger-style base
 * conversion + leading-zero pad" approach.
 *
 * Performance: n=34 bytes (multicodec + 32-byte key) → ~50 iterations of the
 * inner loop. Negligible compared to a single KMS call.
 */
export function base58btcEncode(bytes: Uint8Array): string {
  if (bytes.length === 0) return "";

  // Count leading zero bytes — each maps to a leading "1" in base58.
  let zeros = 0;
  while (zeros < bytes.length && bytes[zeros] === 0) zeros++;

  // Convert bytes to base58 digits via repeated division.
  // Working buffer sized via the well-known log(256)/log(58) ≈ 1.366 bound.
  const size = Math.floor(((bytes.length - zeros) * 138) / 100) + 1;
  const buf = new Uint8Array(size);

  let length = 0;
  for (let i = zeros; i < bytes.length; i++) {
    let carry = bytes[i];
    let j = 0;
    for (let k = size - 1; (carry !== 0 || j < length) && k >= 0; k--, j++) {
      carry += 256 * buf[k];
      buf[k] = carry % 58;
      carry = Math.floor(carry / 58);
    }
    if (carry !== 0) {
      throw new Error("base58btcEncode: non-zero carry — input too large");
    }
    length = j;
  }

  // Skip leading zeros in the encoded buffer.
  let it = size - length;
  while (it < size && buf[it] === 0) it++;

  let out = "";
  for (let i = 0; i < zeros; i++) out += BASE58_ALPHABET[0];
  for (; it < size; it++) out += BASE58_ALPHABET[buf[it]];
  return out;
}

/**
 * Derive a stable `#fragment` from a KMS resource name. We use the trailing
 * `cryptoKeyVersions/<n>` suffix so the verificationMethod id changes when
 * (and only when) the underlying key version rotates — which is exactly the
 * boundary callers need for the §G overlap shape.
 *
 * Throws on missing suffix: silently defaulting to `"key-1"` would produce a
 * misleading verificationMethod id that doesn't track the underlying key,
 * breaking §G rotation overlap and §F audit trail. The signer's
 * `assertKeyResourceName` already enforces the same suffix, so callers that
 * round-trip through KmsSigner cannot trip this; the duplicated guard exists
 * because the builder is also reachable from non-signer code paths.
 */
function keyVersionToFragment(kmsKeyResourceName: string): string {
  const m = /\/cryptoKeyVersions\/(\d+)$/.exec(kmsKeyResourceName);
  if (!m) {
    throw new Error(
      `Invalid KMS key resource name: "${kmsKeyResourceName}". ` +
        "Expected to end with /cryptoKeyVersions/<n> so the DID Document " +
        "verificationMethod id (#key-<n>) can track key rotation (§G).",
    );
  }
  return `key-${m[1]}`;
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (clean.length % 2 !== 0) {
    throw new Error(`hex string must have even length, got ${clean.length}`);
  }
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    const pair = clean.slice(i * 2, i * 2 + 2);
    if (!/^[0-9a-fA-F]{2}$/.test(pair)) {
      throw new Error(`invalid hex char at offset ${i * 2}`);
    }
    out[i] = Number.parseInt(pair, 16);
  }
  return out;
}
