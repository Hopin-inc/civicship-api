/**
 * GCP KMS Ed25519 signer wrapper.
 *
 * Civicship's Issuer DID (`did:web:api.civicship.app`) signs every internally
 * issued VC and every DID anchor batch via a GCP KMS-managed Ed25519 key.
 * The platform never holds the private key locally — all signing flows route
 * through `KeyManagementServiceClient.asymmetricSign` and authenticate via
 * Application Default Credentials (`GOOGLE_APPLICATION_CREDENTIALS`).
 *
 * This module is intentionally a thin, DI-friendly adapter:
 *   - no business logic
 *   - no caching of public keys (callers cache when appropriate, e.g. the
 *     Issuer DID Document service caches the JWK with TTL 1h, design §5.1.2)
 *   - no transactional concerns
 *
 * Key resource naming (design §I / §5.1.1):
 *   `projects/{p}/locations/{l}/keyRings/{r}/cryptoKeys/civicship-issuer-vc/cryptoKeyVersions/N`
 *
 * Output normalization:
 *   GCP KMS Ed25519 (`EC_SIGN_ED25519`) returns a raw 64-byte signature per
 *   the public KMS docs. Older versions of the proto did once return a DER
 *   `SEQUENCE { r, s }` for some asymmetric algorithms, and SDK upgrades have
 *   historically blurred the boundary, so we *defensively* detect a DER
 *   wrapper and unwrap it to raw 64 bytes. If the response is already 64
 *   bytes we pass it through untouched.
 *
 * Public key normalization:
 *   `getPublicKey` returns a PEM-encoded SubjectPublicKeyInfo (SPKI). For
 *   Ed25519 this is always `30 2A 30 05 06 03 2B 65 70 03 21 00 || raw32`.
 *   We strip the SPKI header and return the raw 32 bytes so callers can
 *   build `publicKeyMultibase` / JWK / Cardano credentials directly.
 *
 * Retry policy (design §3.4 / §5.1.5):
 *   - 5xx and transient gRPC errors → exponential backoff, max 3 attempts
 *   - 4xx (PERMISSION_DENIED, NOT_FOUND, INVALID_ARGUMENT) → propagate
 *     immediately. Burning attempts on a misconfigured key resource just
 *     hides the real error.
 *   The retry shape mirrors the Blockfrost client (#1096) — recursive helper
 *   to keep stack frames intelligible in production logs.
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.1.1 (this module)
 *   docs/report/did-vc-internalization.md §3.4   (採用ライブラリ)
 *   docs/report/did-vc-internalization.md §I / §9.1.5 (KMS resource naming, global location)
 */

import { KeyManagementServiceClient } from "@google-cloud/kms";
import { injectable } from "tsyringe";

/** Maximum number of attempts (1 initial + 2 retries = 3 attempts total). */
const MAX_ATTEMPTS = 3;

/** Base backoff in ms for the first retry; doubles each step. */
const BASE_BACKOFF_MS = 200;

/**
 * gRPC status codes we treat as retryable. Aligns with Google's published
 * retry guidance for KMS — UNAVAILABLE / DEADLINE_EXCEEDED / INTERNAL.
 *
 * 14 = UNAVAILABLE, 4 = DEADLINE_EXCEEDED, 13 = INTERNAL, 8 = RESOURCE_EXHAUSTED
 */
const RETRYABLE_GRPC_CODES = new Set<number>([4, 8, 13, 14]);

/** HTTP statuses we treat as retryable when the SDK happens to surface them. */
const RETRYABLE_HTTP_STATUSES = new Set<number>([429, 500, 502, 503, 504]);

/**
 * Minimal interface a `KeyManagementServiceClient` must satisfy for our
 * needs. We declare only what we use so unit tests can supply a hand-rolled
 * stub without instantiating the real (auth-requiring) gRPC client.
 */
export interface KmsClientLike {
  asymmetricSign(request: {
    name: string;
    data: Uint8Array;
  }): Promise<[{ signature?: Uint8Array | Buffer | string | null }, ...unknown[]]>;
  getPublicKey(request: { name: string }): Promise<[{ pem?: string | null }, ...unknown[]]>;
}

@injectable()
export class KmsSigner {
  private readonly client: KmsClientLike;

  /**
   * @param client Optional KMS client. Production code calls `new KmsSigner()`
   *   and lets us instantiate the real `KeyManagementServiceClient` (which
   *   reads ADC from `GOOGLE_APPLICATION_CREDENTIALS`). Tests pass a stub.
   *
   * The constructor does NOT validate credentials proactively — the gRPC
   * client lazily initializes the auth client on first call, so credential
   * problems surface as a 4xx on the first sign and propagate immediately.
   */
  constructor(client?: KmsClientLike) {
    this.client = client ?? new KeyManagementServiceClient();
  }

  /**
   * Sign `payload` with the Ed25519 key identified by `keyResourceName`.
   *
   * @param keyResourceName Full KMS resource name, including the
   *   `cryptoKeyVersions/N` segment. The version pin is required because
   *   omitting it causes KMS to refuse the request (`INVALID_ARGUMENT`).
   * @param payload Raw bytes to sign. Ed25519 is PureEdDSA — KMS expects the
   *   data itself, not a pre-hashed digest. Do NOT pass a SHA-512 hash.
   * @returns Raw 64-byte Ed25519 signature.
   */
  async signEd25519(keyResourceName: string, payload: Uint8Array): Promise<Uint8Array> {
    assertKeyResourceName(keyResourceName);

    const [response] = await this.withRetry(() =>
      this.client.asymmetricSign({
        name: keyResourceName,
        data: payload,
      }),
    );
    const sig = response.signature;
    if (sig == null) {
      throw new Error(`KMS asymmetricSign returned no signature for ${keyResourceName}`);
    }
    return normalizeEd25519Signature(toUint8Array(sig));
  }

  /**
   * Fetch the raw 32-byte Ed25519 public key for `keyResourceName`.
   *
   * KMS returns PEM-encoded SPKI; we unwrap the fixed Ed25519 SPKI prefix
   * and return raw 32 bytes. Callers building DID Documents pass these
   * bytes directly to `multicodec(0xed01) + base58btc` (design §5.1.2).
   */
  async getPublicKey(keyResourceName: string): Promise<Uint8Array> {
    assertKeyResourceName(keyResourceName);

    const [response] = await this.withRetry(() =>
      this.client.getPublicKey({ name: keyResourceName }),
    );
    if (!response.pem) {
      throw new Error(`KMS getPublicKey returned empty PEM for ${keyResourceName}`);
    }
    return extractEd25519RawFromSpkiPem(response.pem);
  }

  /**
   * Recursive retry helper. Mirrors the structure used by the Blockfrost
   * client so failure logs in production look the same shape across both
   * external services.
   */
  private async withRetry<T>(op: () => Promise<T>, attempt = 1): Promise<T> {
    try {
      return await op();
    } catch (err) {
      if (attempt >= MAX_ATTEMPTS || !isRetryable(err)) {
        throw err;
      }
      const delayMs = BASE_BACKOFF_MS * Math.pow(2, attempt - 1);
      await sleep(delayMs);
      return this.withRetry(op, attempt + 1);
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers — exported only when a unit test value can call them in isolation
// ---------------------------------------------------------------------------

/**
 * Validate the KMS resource name shape (design §I).
 *
 * We do not over-validate: KMS itself will reject malformed names with
 * INVALID_ARGUMENT. We just guard the obvious foot-gun of forgetting the
 * `/cryptoKeyVersions/N` suffix, since asymmetricSign requires a pinned
 * version and the resulting error message ("Resource projects/.../cryptoKeys
 * not found") is unhelpful.
 */
export function assertKeyResourceName(name: string): void {
  if (typeof name !== "string" || name.length === 0) {
    throw new TypeError("KMS keyResourceName must be a non-empty string");
  }
  if (!/\/cryptoKeyVersions\/\d+$/.test(name)) {
    throw new Error(
      `KMS keyResourceName must end with /cryptoKeyVersions/<n>, got "${name}". ` +
        "Pin the version explicitly so signatures stay stable across rotations (design §5.1.1).",
    );
  }
}

/**
 * Normalize an Ed25519 signature to raw 64 bytes.
 *
 * - 64 bytes already? return as-is.
 * - DER `SEQUENCE { INTEGER r, INTEGER s }` (used historically by some KMS
 *   asymmetric responses for ECDSA shapes that share Ed25519's API surface)?
 *   strip the wrapper and re-pad each integer to 32 bytes.
 * - Anything else → throw with the actual length so misconfiguration is
 *   immediately diagnosable.
 */
export function normalizeEd25519Signature(sig: Uint8Array): Uint8Array {
  if (sig.length === 64) {
    return sig;
  }
  // Try DER SEQUENCE { INTEGER r, INTEGER s }
  if (sig.length >= 8 && sig[0] === 0x30) {
    const parsed = tryParseDerEcdsaToRaw64(sig);
    if (parsed) return parsed;
  }
  throw new Error(
    `Unexpected KMS signature length ${sig.length}; expected raw 64 bytes ` +
      "or DER-encoded SEQUENCE for Ed25519 (design §5.1.1).",
  );
}

/**
 * Parse a DER `SEQUENCE { INTEGER, INTEGER }` into a raw 64-byte buffer
 * (`r || s`, each left-padded to 32 bytes). Returns null if the bytes are
 * not a well-formed SEQUENCE — caller treats that as "not DER, give up".
 *
 * DER encoding is permissive about leading zeros (added when r/s would
 * otherwise have a high bit set, since DER INTEGERs are signed). We strip
 * those to get the "natural" big-endian value, then left-pad to 32.
 */
function tryParseDerEcdsaToRaw64(der: Uint8Array): Uint8Array | null {
  let i = 0;
  if (der[i++] !== 0x30) return null;
  const seqLen = der[i++];
  if (seqLen + 2 !== der.length) return null;

  if (der[i++] !== 0x02) return null;
  const rLen = der[i++];
  if (i + rLen > der.length) return null;
  const r = stripLeadingZeros(der.subarray(i, i + rLen));
  i += rLen;

  if (der[i++] !== 0x02) return null;
  const sLen = der[i++];
  if (i + sLen !== der.length) return null;
  const s = stripLeadingZeros(der.subarray(i, i + sLen));

  if (r.length > 32 || s.length > 32) return null;

  const out = new Uint8Array(64);
  out.set(r, 32 - r.length);
  out.set(s, 64 - s.length);
  return out;
}

function stripLeadingZeros(b: Uint8Array): Uint8Array {
  let start = 0;
  while (start < b.length - 1 && b[start] === 0x00) start++;
  return b.subarray(start);
}

/**
 * Extract the raw 32-byte Ed25519 public key from a PEM-encoded SPKI blob.
 *
 * Ed25519 SPKI structure (RFC 8410 §4):
 *   30 2A                       SEQUENCE (42 bytes)
 *     30 05                     SEQUENCE (5 bytes)  -- algorithm
 *       06 03 2B 65 70          OID 1.3.101.112 (id-Ed25519)
 *     03 21 00 <32 bytes>       BIT STRING wrapping raw key
 *
 * We don't run a full ASN.1 parser — for Ed25519 the SPKI prefix is a
 * 12-byte constant. If it doesn't match we throw, so a future swap of key
 * type (e.g. P-256) surfaces immediately rather than silently producing
 * garbage 32-byte slices.
 */
export function extractEd25519RawFromSpkiPem(pem: string): Uint8Array {
  const der = pemToDer(pem);
  // RFC 8410: total SPKI length = 12 (prefix) + 32 (key) = 44 bytes
  if (der.length !== 44) {
    throw new Error(
      `Unexpected SPKI length ${der.length} for Ed25519 (expected 44 bytes). ` +
        "Verify the KMS key purpose is ASYMMETRIC_SIGN with algorithm EC_SIGN_ED25519.",
    );
  }
  const expectedPrefix = new Uint8Array([
    0x30, 0x2a, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x70, 0x03, 0x21, 0x00,
  ]);
  for (let i = 0; i < expectedPrefix.length; i++) {
    if (der[i] !== expectedPrefix[i]) {
      throw new Error(
        `SPKI prefix at byte ${i} = 0x${der[i].toString(16)} does not match Ed25519 (RFC 8410). ` +
          "The KMS key may not be Ed25519.",
      );
    }
  }
  return der.subarray(12, 44);
}

function pemToDer(pem: string): Uint8Array {
  const cleaned = pem
    .replace(/-----BEGIN [^-]+-----/g, "")
    .replace(/-----END [^-]+-----/g, "")
    .replace(/\s+/g, "");
  if (cleaned.length === 0) {
    throw new Error("PEM body is empty after stripping headers");
  }
  // Buffer.from with base64 tolerates any whitespace already removed; the
  // 'base64' decoder ignores stray characters, so an obviously corrupt PEM
  // would surface later when SPKI parsing rejects the byte length.
  return new Uint8Array(Buffer.from(cleaned, "base64"));
}

function toUint8Array(value: Uint8Array | Buffer | string): Uint8Array {
  if (value instanceof Uint8Array) return value;
  if (typeof value === "string") {
    // The proto can serialize bytes as base64-encoded strings under JSON
    // transport. Defensive: we accept either.
    return new Uint8Array(Buffer.from(value, "base64"));
  }
  // unreachable per the proto type, but keep TS happy
  throw new TypeError(`Unsupported signature representation: ${typeof value}`);
}

/**
 * Decide whether to retry an error from the KMS gRPC client.
 *
 * The Google gax client surfaces errors in two shapes:
 *   - `{ code: <gRPC status>, message }` for native gRPC failures
 *   - `{ status: <HTTP code> }` for REST fallbacks
 * Both paths are handled.
 */
function isRetryable(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const code = (err as { code?: unknown }).code;
  if (typeof code === "number" && RETRYABLE_GRPC_CODES.has(code)) {
    return true;
  }
  const status = (err as { status?: unknown }).status;
  if (typeof status === "number" && RETRYABLE_HTTP_STATUSES.has(status)) {
    return true;
  }
  return false;
}

function sleep(ms: number): Promise<void> {
  // S7034: use a block-form executor with explicit return-of-undefined to
  // avoid the implicit-return lint trap (no `r => setTimeout(r, ms)`).
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
