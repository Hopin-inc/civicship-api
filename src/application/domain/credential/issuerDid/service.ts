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
  type IssuerDidDocument,
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
          "Run the rotation runbook to activate a KMS key version before " +
          "enabling internal VC issuance (design §G).",
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

// Exported for tests — see file-header re: TTL cache.
export { PUBLIC_KEY_TTL_MS };
