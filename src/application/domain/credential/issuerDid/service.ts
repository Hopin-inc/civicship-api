/**
 * `IssuerDidService` — application-layer entry point for the civicship
 * platform Issuer DID (`did:web:api.civicship.app`, §5.4.3).
 *
 * Responsibilities:
 *
 *   1. Resolve the **canonical Issuer DID** (a hard-coded constant — there is
 *      exactly one, bound to the API host).
 *   2. Build the **Issuer DID Document** that `/.well-known/did.json` serves:
 *      DB lookup of the active KMS key version → KMS public-key fetch (with
 *      a TTL cache) → delegate to `IssuerDidBuilder.buildIssuerDidDocument`.
 *   3. Provide a **signing primitive** (`signWithActiveKey`) so other
 *      services (Phase 1 step 9 `VcIssuanceService`, anchor batch worker)
 *      can sign payloads without learning the key resource name.
 *
 * Boundary discipline:
 *
 *   - Does NOT cache the *DID Document object* itself — only the public key
 *     bytes. The DID Document is small and the cost of re-running
 *     `IssuerDidBuilder.buildIssuerDidDocument` is dwarfed by the KMS round-
 *     trip. Caching the document directly would also leak any future
 *     per-request mutations (e.g. embedding a `verificationRelationship`
 *     selected by header).
 *
 *   - Does NOT manage transactions — `findActiveKey()` is a single read
 *     against `t_issuer_did_keys`, which has no community scope. Callers
 *     that issue VCs DO open transactions, but the issuer-key read is
 *     deliberately outside those (it's a global lookup table).
 *
 *   - Does NOT decide what to do when no active key exists. Returning
 *     `null` from `getActiveIssuerDidDocument` is intentional — the router
 *     translates that to the minimal static Document so dev/staging
 *     environments remain operable before the first key is provisioned.
 *
 * §G key-rotation scope (Phase 1 vs Phase 2):
 *
 *   Phase 1 shipped **single-active-key** mode via
 *   `getActiveIssuerDidDocument()` — one row from `findActiveKey()`, one
 *   `verificationMethod` entry, hard cut-over rotation.
 *
 *   Phase 2 (this layer, PR #1100) adds `buildDidDocument()` — the §G
 *   overlap multi-key shape per spec §5.4.3 line 1131-1142. It calls
 *   `repository.listActiveKeys()` and publishes **every** key in the
 *   overlap window (ENABLED + DISABLED) so verifiers can validate VCs
 *   signed by either the new or the rotating-out key during the 24-hour
 *   grace period (§9.1.2). `assertionMethod` / `authentication`
 *   reference only ENABLED rows — DISABLED rows are verification-only
 *   tails kept forever (§9.1.3, no DESTROYED).
 *
 *   The single-key entry point `getActiveIssuerDidDocument()` is
 *   preserved for backward compatibility (existing router wiring, admin
 *   GraphQL Phase 1 contract). The router will migrate to
 *   `buildDidDocument()` once §G is fully exercised in staging
 *   (`docs/runbooks/issuer-did-key-rotation.md`).
 *
 * TTL cache rationale:
 *
 *   The KMS public key for a given resource name is **immutable** — once a
 *   `cryptoKeyVersions/N` is created, its public key never changes. The
 *   only reason we use a TTL (rather than caching forever) is to bound the
 *   blast radius of a stale-cache bug: if the KMS resource name on a row
 *   somehow refers to the wrong version, a 1-hour TTL caps how long a bad
 *   `verificationMethod` can ride out in the DID Document. Real rotation
 *   advances the key resource name (a different cache key entirely), so
 *   the TTL never gates rotation throughput.
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.4.3 (this service)
 *   docs/report/did-vc-internalization.md §5.1.1 (KMS resource naming)
 *   docs/report/did-vc-internalization.md §5.1.2 (Issuer DID Document shape)
 *   docs/report/did-vc-internalization.md §G    (key rotation overlap)
 */

import { inject, injectable } from "tsyringe";

import logger from "@/infrastructure/logging";
import type { IIssuerDidKeyRepository } from "@/application/domain/credential/issuerDid/data/interface";
import {
  CIVICSHIP_ISSUER_DID,
  buildIssuerDidDocument,
  buildMultiKeyIssuerDidDocument,
  encodeEd25519Jwk,
  kmsResourceNameToKid,
  type IssuerActiveKey,
  type IssuerDidDocument,
  type IssuerMultiKeyDidDocument,
} from "@/infrastructure/libs/did/issuerDidBuilder";
import { KmsSigner } from "@/infrastructure/libs/kms/kmsSigner";

/**
 * Public-key cache TTL. 1 hour — see file-header rationale. Exposed as a
 * module-level const (rather than a constructor arg) because tests reach
 * for `IssuerDidService.PUBLIC_KEY_TTL_MS` to assert TTL behaviour without
 * having to pass the value through DI.
 */
const PUBLIC_KEY_TTL_MS = 60 * 60 * 1000;

/**
 * Cached entry for a single KMS key resource name.
 *
 * `publicKeyHex` is the lowercase 64-char hex string the
 * `IssuerDidBuilder` expects. Stored pre-encoded so cache hits don't
 * re-run the bytes-to-hex loop.
 */
interface CachedPublicKey {
  publicKeyHex: string;
  expiresAt: number;
}

@injectable()
export default class IssuerDidService {
  /**
   * Per-resource-name cache. Map (rather than a single entry) so a §G
   * rotation that activates a *new* resource name doesn't evict the still-
   * valid entry for the old one — both keys may be needed during the
   * overlap window.
   *
   * Memory-growth note: this Map lives for the process lifetime and entries
   * are never explicitly evicted (only TTL-skipped on read). Unbounded
   * growth is acceptable in Phase 1 because key rotations are rare events
   * (target ≤ 1 / quarter per §G) — the steady-state cardinality is 1 and
   * the worst case during an overlap window is 2. If rotation cadence ever
   * accelerates (e.g. compromise-driven re-keys), or if this cache is
   * reused for non-issuer keys, switch to an LRU with a small bound (≤ 16
   * entries) — every entry is ~80 bytes so memory pressure is theoretical
   * not practical.
   * TODO(Phase 2): replace with an LRU once §G overlap is implemented and
   * `listActiveKeys()` becomes the primary read path.
   */
  private readonly publicKeyCache = new Map<string, CachedPublicKey>();

  /**
   * Optional clock injection for tests. Production passes `undefined` and
   * we use `Date.now`. Tests pass a controlled clock so TTL tests don't
   * race the real wall clock.
   */
  private readonly now: () => number;

  constructor(
    @inject("IssuerDidKeyRepository")
    private readonly repository: IIssuerDidKeyRepository,
    @inject("KmsSigner")
    private readonly kms: KmsSigner,
    /**
     * Optional time source. Defaulted in the body so tsyringe doesn't try
     * to resolve a `now` token from the container.
     */
    now?: () => number,
  ) {
    this.now = now ?? Date.now;
  }

  /**
   * The canonical Issuer DID. Argument-less because civicship has exactly
   * one, hard-coded to the API host. Synchronous so call-sites that need
   * the DID for log lines / metrics / GraphQL fields don't have to await.
   */
  getActiveIssuerDid(): string {
    return CIVICSHIP_ISSUER_DID;
  }

  /**
   * Build the Issuer DID Document for `/.well-known/did.json`.
   *
   * Returns `null` when no active key is registered (bootstrap state).
   * The router maps null to the minimal static Document; never returns
   * 503 for this case — dev/staging UX matters and a syntactically-valid
   * `did:web` body is harmless until the first VC is issued.
   *
   * Throws (and surfaces a 500) when a KMS lookup fails — that is a
   * genuine misconfiguration (wrong resource name, expired ADC, etc.) and
   * the operator needs the error rather than a degraded fallback.
   */
  async getActiveIssuerDidDocument(): Promise<IssuerDidDocument | null> {
    const activeKey = await this.repository.findActiveKey();
    if (activeKey === null) {
      // Bootstrap state — file-header comment in `data/repository.ts`
      // explains why `null` is the right signal. Logged at debug level
      // because in dev/staging this is the steady state until the first
      // key is provisioned; warn-level would spam logs.
      logger.debug("[IssuerDidService] no active issuer key — falling through to static stub");
      return null;
    }

    const publicKeyHex = await this.fetchPublicKeyHex(activeKey.kmsKeyResourceName);

    return buildIssuerDidDocument({
      kmsKeyResourceName: activeKey.kmsKeyResourceName,
      publicKeyEd25519Hex: publicKeyHex,
    });
  }

  /**
   * Build the §G overlap multi-key Issuer DID Document (spec §5.4.3
   * line 1131-1142 / Phase 2 PR #1100).
   *
   * Combines every row in the §G overlap window (`listActiveKeys()` —
   * ENABLED + DISABLED) with their KMS-fetched public-key bytes and
   * emits the spec's `JsonWebKey2020` shape:
   *
   *   - `verificationMethod[]`: every key (ENABLED + DISABLED) so past
   *     VCs signed by a rotating-out key remain verifiable (§9.1.3).
   *   - `assertionMethod` / `authentication`: ENABLED only — DISABLED
   *     keys MUST NOT be advertised as signable (§9.1.2).
   *
   * Returns `null` when no keys are registered. The router falls back to
   * the same minimal static Document as `getActiveIssuerDidDocument()`,
   * preserving dev/staging UX during bootstrap.
   *
   * ENABLED vs DISABLED mapping: the repository contract says a row's
   * `deactivatedAt IS NULL` ↔ KMS state ENABLED, and `deactivatedAt IS NOT
   * NULL` ↔ KMS state DISABLED (rotating-out, retained for verification).
   * We trust the row state here rather than re-querying KMS lifecycle on
   * every `/.well-known/did.json` hit — the rotation runbook is the
   * single writer of both `deactivatedAt` and the KMS state transition,
   * and the public-key bytes (which are the part KMS authoritatively
   * owns) are still fetched per-key via the existing TTL cache.
   *
   * Ordering: rows are emitted in `listActiveKeys()` order (which the
   * repository contract pins to `activatedAt ASC`). Stable ordering means
   * `verificationMethod` indices stay constant across re-renders.
   *
   * **Parallelism**: per-row `fetchPublicKeyHex` calls are issued via
   * `Promise.all`. Cache hits resolve synchronously; cache misses each
   * fire one KMS round-trip and parallelizing them keeps cold-start
   * latency at `O(1 × RTT)` rather than `O(rows × RTT)`.
   *
   * Design references:
   *   docs/report/did-vc-internalization.md §5.4.3 line 1126-1142
   *   docs/report/did-vc-internalization.md §9.1.2 (24h overlap)
   *   docs/report/did-vc-internalization.md §9.1.3 (旧鍵永続保持)
   *   docs/report/did-vc-internalization.md §16    (Phase 2 持ち越し)
   */
  async buildDidDocument(): Promise<IssuerMultiKeyDidDocument | null> {
    const rows = await this.repository.listActiveKeys();
    if (rows.length === 0) {
      // Same bootstrap signal as `findActiveKey() === null`. The router
      // maps null to the minimal static Document.
      logger.debug("[IssuerDidService.buildDidDocument] no keys in §G overlap window");
      return null;
    }

    const activeKeys: IssuerActiveKey[] = await Promise.all(
      rows.map(async (row) => {
        const publicKeyHex = await this.fetchPublicKeyHex(row.kmsKeyResourceName);
        // Reuse the same hex → bytes path as `bytesToHex`'s inverse — we
        // already encoded bytes → hex in the cache; here we decode hex →
        // bytes for JWK encoding. Keeping the cache value in hex (rather
        // than as Uint8Array) lets the legacy `buildIssuerDidDocument`
        // path remain unchanged; the round-trip cost is negligible
        // (32 bytes) versus invalidating the existing cache shape.
        const publicKeyBytes = hexToBytes(publicKeyHex);
        return {
          kid: kmsResourceNameToKid(row.kmsKeyResourceName),
          jwk: encodeEd25519Jwk(publicKeyBytes),
          enabled: row.deactivatedAt === null,
        };
      }),
    );

    return buildMultiKeyIssuerDidDocument(activeKeys);
  }

  /**
   * Sign `payload` with the currently-active KMS key.
   *
   * Used by `VcIssuanceService` (Phase 1 step 9) and the anchor batch
   * worker. Throws when no active key is registered: signing has no
   * meaningful fallback (you cannot emit an unsigned VC), so callers MUST
   * have provisioned a key before invoking signing flows. In practice the
   * deployment runbook will register the first key before any feature
   * flag flips internal VC issuance on.
   */
  async signWithActiveKey(payload: Uint8Array): Promise<Uint8Array> {
    const activeKey = await this.repository.findActiveKey();
    if (activeKey === null) {
      throw new Error(
        "IssuerDidService.signWithActiveKey: no active issuer key registered. " +
          "Activate a KMS key version before enabling internal VC issuance — " +
          "see runbook at docs/runbooks/issuer-did-key-rotation.md " +
          "(design §G). NOTE: the runbook itself ships in a separate PR; " +
          "until it lands, follow the activation sequence outlined in " +
          "docs/report/did-vc-internalization.md §5.4.3 / §G.",
      );
    }
    return this.kms.signEd25519(activeKey.kmsKeyResourceName, payload);
  }

  // -------------------------------------------------------------------------
  // Internals
  // -------------------------------------------------------------------------

  /**
   * Fetch the raw public key for `keyResourceName` and return it as a
   * lowercase hex string. Memoized for `PUBLIC_KEY_TTL_MS`.
   *
   * Public keys for a pinned KMS `cryptoKeyVersions/N` are immutable, so
   * stale-read risk is bounded; see file-header for full rationale.
   */
  private async fetchPublicKeyHex(keyResourceName: string): Promise<string> {
    const cached = this.publicKeyCache.get(keyResourceName);
    if (cached && cached.expiresAt > this.now()) {
      return cached.publicKeyHex;
    }

    const rawBytes = await this.kms.getPublicKey(keyResourceName);
    const publicKeyHex = bytesToHex(rawBytes);

    this.publicKeyCache.set(keyResourceName, {
      publicKeyHex,
      expiresAt: this.now() + PUBLIC_KEY_TTL_MS,
    });

    return publicKeyHex;
  }
}

/**
 * Encode raw bytes as a lowercase hex string (no `0x` prefix).
 *
 * Hand-rolled rather than `Buffer.from(bytes).toString("hex")` so the
 * dependency is on Node's built-in number formatting only — keeps the
 * service file portable to Edge / Workers runtimes if we ever need to
 * inline-test it outside Node.
 */
function bytesToHex(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    out += (b >>> 4).toString(16);
    out += (b & 0x0f).toString(16);
  }
  return out;
}

/**
 * Inverse of `bytesToHex`. Used by `buildDidDocument` to round-trip the
 * cached hex back into raw bytes for JWK encoding.
 *
 * Implementation: `Buffer.from(hex, "hex")` is the canonical Node fast
 * path, but it silently truncates at the first non-hex character (e.g.
 * `Buffer.from("1z", "hex").length === 0`) so we cannot rely on it for
 * input validation. A single whole-string regex test runs before the
 * decode and rejects any non-hex char up front; the decode itself is
 * then guaranteed to consume every byte.
 *
 * The earlier NaN-only guard (`Number.isNaN(parseInt(pair, 16))`) had
 * a real defect noted by Gemini on PR #1123: `parseInt("1z", 16)`
 * returns 1 (parseInt stops at the first invalid char), so a non-hex
 * character would slip through and produce a silently truncated value.
 * Switching to a whole-string regex + Buffer decode also avoids the
 * per-pair loop pattern duplicated in `issuerDidBuilder.ts` (Sonar
 * duplication detector flagged the byte-identical loop).
 */
function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (clean.length % 2 !== 0) {
    throw new Error(`hex string must have even length, got ${clean.length}`);
  }
  // Anchored character class with `*` — linear time, no backtracking.
  if (!/^[0-9a-fA-F]*$/.test(clean)) {
    throw new Error("hex string contains non-hex characters");
  }
  return new Uint8Array(Buffer.from(clean, "hex"));
}

// Exported for tests — see file-header re: TTL cache.
export { PUBLIC_KEY_TTL_MS };
