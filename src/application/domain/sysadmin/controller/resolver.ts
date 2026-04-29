import { inject, injectable } from "tsyringe";
import { IContext } from "@/types/server";
import AnalyticsUseCase from "@/application/domain/analytics/usecase";
import AnalyticsCommunityUseCase from "@/application/domain/analytics/community/usecase";
import {
  GqlQuerySysAdminCommunityDetailArgs,
  GqlQuerySysAdminDashboardArgs,
  GqlSysAdminCommunityDetailPayload,
  GqlSysAdminDashboardPayload,
} from "@/types/graphql";

/**
 * Backwards-compatible shim for the legacy `sysAdmin*` query surface.
 * Delegates to AnalyticsUseCase / AnalyticsCommunityUseCase under the
 * hood so there's only one implementation path. Both query names are
 * marked `@deprecated` in the schema; once the frontend has migrated
 * to `analyticsDashboard` / `analyticsCommunity`, this shim and its
 * schema can be deleted in a follow-up PR (Phase H).
 */
@injectable()
export default class SysAdminResolver {
  constructor(
    @inject("AnalyticsUseCase") private readonly analyticsUseCase: AnalyticsUseCase,
    @inject("AnalyticsCommunityUseCase")
    private readonly analyticsCommunityUseCase: AnalyticsCommunityUseCase,
  ) {}

  Query = {
    sysAdminDashboard: async (
      _: unknown,
      args: GqlQuerySysAdminDashboardArgs,
      ctx: IContext,
    ): Promise<GqlSysAdminDashboardPayload> => {
      // The new payload type has the same shape as the legacy one
      // (1:1 schema rename in commit 3); cast through unknown so the
      // type-system accepts the structural-equivalence we already
      // verified at the GraphQL level.
      const result = await this.analyticsUseCase.getDashboard(args as never, ctx);
      return result as unknown as GqlSysAdminDashboardPayload;
    },

    sysAdminCommunityDetail: async (
      _: unknown,
      args: GqlQuerySysAdminCommunityDetailArgs,
      ctx: IContext,
    ): Promise<GqlSysAdminCommunityDetailPayload> => {
      const result = await this.analyticsCommunityUseCase.getCommunity(
        args as never,
        ctx,
      );
      return result as unknown as GqlSysAdminCommunityDetailPayload;
    },
  };
}
