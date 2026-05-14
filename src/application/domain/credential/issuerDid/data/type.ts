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
 * Schema status -----------------------------------------------------------
 *
 * The Prisma model `IssuerDidKey` is now in the schema (migration
 * `20260512060000_add_issuer_did_keys`). `IssuerDidKeyRow` is the
 * application-layer view of one row from that table — kept as a
 * dedicated type so the persistence shape (`Prisma.IssuerDidKey`) and
 * the domain shape can evolve independently if the schema later grows
 * fields the service doesn't need (e.g. ops-only annotations).
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
