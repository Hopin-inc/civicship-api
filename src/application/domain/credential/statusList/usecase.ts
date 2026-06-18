/**
 * `StatusListUseCase` — transaction boundary for the StatusList domain.
 *
 * Surface (Phase 1 step 8 scope):
 *
 *   - `allocateNextSlot(ctx)` — wraps `StatusListService.allocateNextSlot`
 *     in a public-issuer transaction. Used by `VcIssuanceService.issueVc`.
 *
 *   - `revokeVc(ctx, input)` — wraps `StatusListService.revokeVc`. Exposed
 *     for the future admin GraphQL mutation (Phase 1 step 10) so the path
 *     is already plumbed end-to-end.
 *
 *   - `getEncodedListJwt(ctx, listKey)` — wraps
 *     `StatusListService.buildStatusListVc`. Used by the public REST
 *     endpoint to serve the list JWT to verifiers.
 *
 * Per CLAUDE.md "Transaction Handling Pattern" the issuer wrapper lives
 * here, not in the service.
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.2.4
 *   docs/report/did-vc-internalization.md §5.4.5
 */

import { inject, injectable } from "tsyringe";
import { IContext } from "@/types/server";
import StatusListService from "@/application/domain/credential/statusList/service";
import type {
  AllocatedSlot,
  RevokeVcInput,
} from "@/application/domain/credential/statusList/data/type";

@injectable()
export default class StatusListUseCase {
  constructor(
    @inject("StatusListService")
    private readonly service: StatusListService,
  ) {}

  async allocateNextSlot(ctx: IContext): Promise<AllocatedSlot> {
    return ctx.issuer.public(ctx, async (tx) => {
      return this.service.allocateNextSlot(ctx, tx);
    });
  }

  async revokeVc(ctx: IContext, input: RevokeVcInput): Promise<void> {
    return ctx.issuer.public(ctx, async (tx) => {
      await this.service.revokeVc(ctx, input, tx);
    });
  }

  /**
   * Public read path for the REST endpoint. Returns `null` when the list
   * does not exist so the router can map that directly to a 404.
   */
  async getEncodedListJwt(ctx: IContext, listKey: string): Promise<string | null> {
    return this.service.buildStatusListVc(ctx, listKey);
  }
}
