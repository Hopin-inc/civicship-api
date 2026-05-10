/**
 * Repository contract for the `issuerDid` application domain.
 *
 * Narrow on purpose — `IssuerDidService` (§5.4.3) only needs to ask "what
 * KMS key should I be signing with right now?" and "list every key the §G
 * overlap window says is still trusted". Heavier admin queries (paginated
 * audit trail, historical lookups by activation date) live behind a
 * separate interface and will be added when key rotation tooling lands.
 *
 * Strategy A note (Phase 1 step 8) ----------------------------------------
 *
 * The Prisma model `IssuerDidKey` is not yet in the schema (§4 redesign in
 * progress). The repository implementation in this PR is a Strategy A stub
 * — `findActiveKey()` returns `null` so the router falls through to the
 * minimal static Document. `listActiveKeys()` returns `[]` for the same
 * reason. Both methods become real Prisma queries once the schema PR adds
 * `t_issuer_did_keys`; the interface itself is forward-compatible with
 * that swap.
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.4.3 (IssuerDidService)
 *   docs/report/did-vc-internalization.md §G    (key rotation overlap)
 */

import type { IssuerDidKeyRow } from "@/application/domain/credential/issuerDid/data/type";

export interface IIssuerDidKeyRepository {
  /**
   * Return the single currently-active key (`deactivatedAt IS NULL`).
   *
   * The contract returns `null` (not throws) when no active key is
   * registered: this is the bootstrap state on a freshly-deployed
   * environment, and the router must degrade gracefully to the minimal
   * static Document rather than 503.
   *
   * If multiple rows have `deactivatedAt = NULL` (mid-rotation §G overlap),
   * the production implementation must return the row most recently
   * activated; `IssuerDidService.signWithActiveKey` always uses this
   * single row, while `getActiveIssuerDidDocument` will (in Phase 2)
   * combine it with `listActiveKeys()` to publish both keys.
   */
  findActiveKey(): Promise<IssuerDidKeyRow | null>;

  /**
   * Return every key in the §G overlap window — all rows where
   * `deactivatedAt IS NULL` plus those whose `deactivatedAt` is within
   * the published verification grace period. Ordered by `activatedAt ASC`
   * so the DID Document `verificationMethod` ordering is stable across
   * re-renders.
   *
   * Returns `[]` (not null) when no keys are registered. Callers building
   * a DID Document use the empty array to drive the same fallback as
   * `findActiveKey() === null`.
   */
  listActiveKeys(): Promise<IssuerDidKeyRow[]>;
}
