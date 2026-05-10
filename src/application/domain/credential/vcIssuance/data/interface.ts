/**
 * Repository contract for the `credential/vcIssuance` application domain.
 *
 * Narrow surface — only `findById` and `create` are needed for Phase 1
 * step 7. Anchor-side fields (`vcAnchorId`, `anchorLeafIndex`) are filled
 * in by a separate `update` call from the weekly anchor batch (Phase 1
 * step 9), which will extend this interface when it lands.
 *
 * Strategy A note (Phase 1 step 7) ----------------------------------------
 *
 * The implementing repository (`VcIssuanceRepositoryStub`) throws
 * `NotImplementedError` for `create` until schema PR #1094 lands; tests
 * inject a `useValue` mock to verify the upstream pipeline.
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.2.2
 */

import type { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import type {
  CreateVcIssuanceInput,
  VcIssuanceRow,
} from "@/application/domain/credential/vcIssuance/data/type";

export interface IVcIssuanceRepository {
  findById(ctx: IContext, id: string): Promise<VcIssuanceRow | null>;

  create(
    ctx: IContext,
    input: CreateVcIssuanceInput,
    tx?: Prisma.TransactionClient,
  ): Promise<VcIssuanceRow>;
}
