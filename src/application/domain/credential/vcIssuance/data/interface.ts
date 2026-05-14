/**
 * Repository contract for the `credential/vcIssuance` application domain.
 *
 * Narrow surface — only `findById` and `create` are needed for Phase 1
 * step 7. Anchor-side fields (`vcAnchorId`, `anchorLeafIndex`) are filled
 * in by a separate `update` call from the weekly anchor batch (Phase 1
 * step 9), which will extend this interface when it lands.
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.2.2
 */

import type { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import type {
  CreateVcIssuanceInput,
  VcAnchorRow,
  VcIssuanceRow,
  VcJwtLeaf,
} from "@/application/domain/credential/vcIssuance/data/type";

export interface IVcIssuanceRepository {
  /**
   * Look up a VC issuance row by id.
   *
   * `tx` is optional: callers running inside an outer transaction (e.g.
   * the revoke flow which composes a StatusList write + `revokedAt`
   * stamp + a re-read in a single commit) supply it so the read happens
   * on the same client and observes the in-progress writes. Read-only
   * callers (the `vcIssuance` query resolver) omit it and the repository
   * opens an issuer-scoped public transaction.
   */
  findById(ctx: IContext, id: string, tx?: Prisma.TransactionClient): Promise<VcIssuanceRow | null>;

  /**
   * Return every VC issuance row owned by `userId`, newest first.
   * Phase 1 step 8 keeps the list unpaginated — the design only foresees
   * a handful of VCs per user; pagination can be added when usage demands.
   */
  findByUserId(ctx: IContext, userId: string): Promise<VcIssuanceRow[]>;

  /**
   * Return every *unrevoked* VC issuance row owned by `userId`. Used by
   * the DID DEACTIVATE → cascade-revoke flow (§14.2 / §E): when a user's
   * DID is tombstoned every still-live VC issued for that subject must
   * be revoked atomically. The filter is `revokedAt IS NULL` so already-
   * revoked rows are skipped and the cascade stays idempotent.
   *
   * `tx` is forwarded so the caller (UserDidUseCase) reads inside the
   * same transaction that flips the StatusList bits — without that, a
   * race between two concurrent DEACTIVATE calls could double-revoke a
   * row (harmless, but noisy).
   */
  findActiveByUserId(
    ctx: IContext,
    userId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<VcIssuanceRow[]>;

  create(
    ctx: IContext,
    input: CreateVcIssuanceInput,
    tx?: Prisma.TransactionClient,
  ): Promise<VcIssuanceRow>;

  /**
   * Look up the `VcAnchor` row that backs a confirmed batch (§5.1.6 /
   * §5.4.6). Returns `null` for unknown ids so the caller can map the
   * "VC has `vcAnchorId` but the anchor row is gone" edge case to a 404
   * rather than crashing.
   */
  findVcAnchorById(ctx: IContext, vcAnchorId: string): Promise<VcAnchorRow | null>;

  /**
   * Return the `vcJwt` strings for the supplied `VcIssuanceRequest.id`
   * list. Used to re-derive the canonical Merkle leaves for the
   * `/vc/:vcId/inclusion-proof` endpoint — we cannot rely on `vcJwt`
   * being indexed in the cached row alone because the proof must verify
   * against the full sibling set of the anchor batch.
   *
   * Rows with a missing/empty `vcJwt` are returned with `vcJwt: ""` so the
   * Service layer can detect the mismatch. Merkle integrity requires the
   * exact same leaf set as anchor time — even one missing leaf shifts the
   * tree and invalidates **every** proof in the batch (not just the
   * affected leaf). Service compares `leaves.length` against
   * `anchor.leafIds.length` and throws on mismatch.
   */
  findVcJwtsByIds(ctx: IContext, vcIssuanceRequestIds: string[]): Promise<VcJwtLeaf[]>;
}
