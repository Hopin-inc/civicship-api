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
  findById(ctx: IContext, id: string): Promise<VcIssuanceRow | null>;

  /**
   * Return every VC issuance row owned by `userId`, newest first.
   * Phase 1 step 8 keeps the list unpaginated — the design only foresees
   * a handful of VCs per user; pagination can be added when usage demands.
   */
  findByUserId(ctx: IContext, userId: string): Promise<VcIssuanceRow[]>;

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
   * Rows with a missing/empty `vcJwt` are dropped silently — a corrupt
   * row at this point would only weaken the proof for OTHER leaves, and
   * the surface is read-only.
   */
  findVcJwtsByIds(ctx: IContext, vcIssuanceRequestIds: string[]): Promise<VcJwtLeaf[]>;
}
