/**
 * `VcIssuanceUseCase` — transaction boundary for the VC issuance flow.
 *
 * Phase 1 step 7 scope (per task brief): provide a transaction boundary so
 * future GraphQL resolvers (Phase 1 step 8) can drop in without re-architecting.
 * Delegates to `VcIssuanceService` for all real work.
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.2.2
 *   CLAUDE.md "Transaction Handling Pattern"
 */

import { inject, injectable } from "tsyringe";
import { IContext } from "@/types/server";
import VcIssuanceService from "@/application/domain/credential/vcIssuance/service";
import type {
  IssueVcInput,
  VcIssuanceRow,
} from "@/application/domain/credential/vcIssuance/data/type";

@injectable()
export default class VcIssuanceUseCase {
  constructor(@inject("VcIssuanceService") private readonly service: VcIssuanceService) {}

  /**
   * Open an issuer-scoped transaction and issue a VC for the supplied
   * claims. The resulting row is `COMPLETED` per §5.2.2 (anchor state is
   * tracked separately on `vcAnchorId`).
   */
  async issueVc(ctx: IContext, input: IssueVcInput): Promise<VcIssuanceRow> {
    return ctx.issuer.public(ctx, async (tx) => {
      return this.service.issueVc(ctx, input, tx);
    });
  }
}
