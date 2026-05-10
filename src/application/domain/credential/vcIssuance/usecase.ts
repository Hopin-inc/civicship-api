/**
 * `VcIssuanceUseCase` — transaction boundary for the VC issuance flow.
 *
 * Phase 1 step 8 scope:
 *   - Adds GraphQL-facing query handlers (`viewVcIssuance` /
 *     `viewVcIssuancesByUser`) that delegate to the service and return
 *     GraphQL types via the presenter.
 *   - Keeps the existing `issueVc` mutation entry that opens a public
 *     transaction.
 *
 * Per CLAUDE.md, the usecase is the only layer that may open a
 * transaction; the service stays unaware of `ctx.issuer.public` etc.
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.2.2
 *   CLAUDE.md "Transaction Handling Pattern"
 */

import { inject, injectable } from "tsyringe";
import { IContext } from "@/types/server";
import VcIssuanceService from "@/application/domain/credential/vcIssuance/service";
import VcIssuancePresenter from "@/application/domain/credential/vcIssuance/presenter";
import type { IssueVcInput as DomainIssueVcInput } from "@/application/domain/credential/vcIssuance/data/type";
import type { GqlIssueVcInput, GqlVcIssuance } from "@/types/graphql";

@injectable()
export default class VcIssuanceUseCase {
  constructor(@inject("VcIssuanceService") private readonly service: VcIssuanceService) {}

  /**
   * GraphQL `vcIssuance(id)` resolver entry. No transaction needed for a
   * read; we still go through `ctx.issuer.public` so RLS is applied
   * consistently with the rest of the codebase.
   */
  async viewVcIssuance(ctx: IContext, id: string): Promise<GqlVcIssuance | null> {
    const row = await this.service.findVcById(ctx, id);
    return row ? VcIssuancePresenter.view(row) : null;
  }

  /**
   * GraphQL `vcIssuancesByUser(userId)` resolver entry. Returns an empty
   * array — never null — to match the GraphQL `[VcIssuance!]!` contract.
   */
  async viewVcIssuancesByUser(ctx: IContext, userId: string): Promise<GqlVcIssuance[]> {
    const rows = await this.service.findVcsByUserId(ctx, userId);
    return rows.map((row) => VcIssuancePresenter.view(row));
  }

  /**
   * Open an issuer-scoped transaction and issue a VC for the supplied
   * claims. The resulting row is `COMPLETED` per §5.2.2 (anchor state is
   * tracked separately on `vcAnchorId`).
   *
   * Accepts the GraphQL input shape directly so the resolver stays
   * transport-thin. The conversion to the service's `IssueVcInput` is a
   * structural projection (only `evaluationId`'s `null → undefined`
   * normalization is needed because the service signature uses optional).
   */
  async issueVc(ctx: IContext, input: GqlIssueVcInput): Promise<GqlVcIssuance> {
    const serviceInput: DomainIssueVcInput = {
      userId: input.userId,
      evaluationId: input.evaluationId ?? undefined,
      subjectDid: input.subjectDid,
      claims: (input.claims ?? {}) as Record<string, unknown>,
    };
    const row = await ctx.issuer.public(ctx, async (tx) => {
      return this.service.issueVc(ctx, serviceInput, tx);
    });
    return VcIssuancePresenter.view(row);
  }
}
