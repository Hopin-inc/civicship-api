/**
 * Domain types for the `issuerDid` application domain (§5.4.3 / §G).
 *
 * The platform has exactly one Issuer DID (`did:web:api.civicship.app`). The
 * persistence layer tracks one row per **KMS key version** so that key
 * rotation (§G overlap shape) is auditable: each row remembers the KMS
 * resource name, when it was activated, and — if rotated out — when it was
 * deactivated. The `did:web` Document served at `/.well-known/did.json`
 * exposes every still-active key as a separate `verificationMethod`.
 *
 * Strategy A note (Phase 1 step 8) ----------------------------------------
 *
 * The Prisma model `IssuerDidKey` is NOT in the schema yet. Until the
 * schema PR adds the table, the repository implementation returns `null`
 * from `findActiveKey()` so the router falls back to the minimal static
 * Document (which preserves dev/staging UX). The shape of `IssuerDidKeyRow`
 * below mirrors the planned columns one-for-one so the swap is mechanical.
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.1.1 (KMS resource naming)
 *   docs/report/did-vc-internalization.md §5.1.2 (Issuer DID Document shape)
 *   docs/report/did-vc-internalization.md §5.4.3 (IssuerDidService)
 *   docs/report/did-vc-internalization.md §G    (key rotation)
 */

/**
 * Single row in the (planned) `t_issuer_did_keys` table. Each row binds a
 * KMS Ed25519 key version to the civicship Issuer DID.
 */
export interface IssuerDidKeyRow {
  /** Stable identifier — cuid in the planned schema. */
  id: string;

  /**
   * Full KMS resource name including `cryptoKeyVersions/N`. Used by
   * `KmsSigner` directly and by `IssuerDidBuilder` to derive the DID
   * Document `verificationMethod` fragment (`#key-N`).
   */
  kmsKeyResourceName: string;

  /**
   * Wall-clock activation. Together with `deactivatedAt`, this is the
   * authoritative record of when this key was eligible to sign.
   */
  activatedAt: Date;

  /**
   * `null` while the key is still active. When set, marks the end of the
   * §G overlap window for this key — verifiers who look up VCs signed
   * during the overlap can still resolve the public key from chain anchors,
   * but new signatures must use the next active key.
   */
  deactivatedAt: Date | null;
}

/**
 * Input shape for activating a key version (admin / rotation runbook).
 * Kept here so future repository methods (`activateKeyVersion`) have a
 * single typed contract; not consumed in Phase 1 step 8 itself.
 */
export interface ActivateIssuerDidKeyInput {
  kmsKeyResourceName: string;
}
