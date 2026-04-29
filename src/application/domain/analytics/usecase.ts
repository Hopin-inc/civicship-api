import { inject, injectable } from "tsyringe";
import { IContext } from "@/types/server";
import {
  GqlAnalyticsCommunityOverview,
  GqlAnalyticsDashboardPayload,
  GqlQueryAnalyticsDashboardArgs,
} from "@/types/graphql";
import AnalyticsCommunityService from "@/application/domain/analytics/community/service";
import AnalyticsPlatformService from "@/application/domain/analytics/platform/service";
import {
  computeDormantCount,
  computeStageCounts,
  computeTenureDistribution,
} from "@/application/domain/analytics/community/aggregations";
import AnalyticsPresenter from "@/application/domain/analytics/presenter";
import AnalyticsConverter from "@/application/domain/analytics/data/converter";
import { jstMonthStart, jstNextMonthStart } from "@/application/domain/report/util";
import { asOfBounds } from "@/application/domain/analytics/community/bounds";

/**
 * Defaults & defensive bounds for the L1 dashboard activity-window.
 * Centralised here (not in community subdomain) because windowDays
 * is a dashboard-level concept; community detail uses windowMonths
 * instead.
 */
const DEFAULT_WINDOW_DAYS = 28;
const MIN_WINDOW_DAYS = 7;
const MAX_WINDOW_DAYS = 90;

@injectable()
export default class AnalyticsUseCase {
  constructor(
    @inject("AnalyticsCommunityService")
    private readonly communityService: AnalyticsCommunityService,
    @inject("AnalyticsPlatformService")
    private readonly platformService: AnalyticsPlatformService,
  ) {}

  /**
   * L1 dashboard: platform totals + one row per community.
   *
   * Fan-out is N in-process calls. At today's community count (~6)
   * this is cheaper than a new bulk repository method.
   */
  async getDashboard(
    { input }: GqlQueryAnalyticsDashboardArgs,
    ctx: IContext,
  ): Promise<GqlAnalyticsDashboardPayload> {
    const asOf = input?.asOf ?? new Date();
    const thresholds = AnalyticsConverter.resolveThresholds(input?.segmentThresholds);
    const windowDays = clampWindowDays(input?.windowDays);
    const hubBreadthThreshold = AnalyticsConverter.clampHubBreadthThreshold(
      input?.hubBreadthThreshold,
    );
    const dormantThresholdDays = AnalyticsConverter.clampDormantThresholdDays(
      input?.dormantThresholdDays,
    );

    const monthStart = jstMonthStart(asOf);
    const platformUpperBound = asOfBounds(asOf).clampFuture(jstNextMonthStart(asOf));

    const [platform, communities] = await Promise.all([
      this.platformService.getPlatformTotals(ctx, monthStart, platformUpperBound),
      this.communityService.getAllCommunities(ctx),
    ]);

    // Single fan-out: each bulk* method issues one SQL covering every
    // community, replacing the previous N×5 per-community roundtrips
    // with 5 total. Per-community computations (stage classification,
    // dormant count, etc.) stay in memory and operate on the
    // already-bucketed rows below.
    const communityIds = communities.map((c) => c.communityId);
    const [
      memberStatsByCommunity,
      windowActivityByCommunity,
      weeklyRetentionByCommunity,
      latestCohortByCommunity,
      hubMemberCountByCommunity,
    ] = await Promise.all([
      this.communityService.getMemberStatsBulk(ctx, communityIds, asOf),
      this.communityService.getWindowActivityBulk(ctx, communityIds, asOf, windowDays),
      this.communityService.getWeeklyRetentionBulk(ctx, communityIds, asOf),
      this.communityService.getLatestCohortBulk(ctx, communityIds, asOf),
      this.communityService.getWindowHubMemberCountBulk(
        ctx,
        communityIds,
        asOf,
        windowDays,
        hubBreadthThreshold,
      ),
    ]);

    const rows: GqlAnalyticsCommunityOverview[] = communities.map((c) => {
      const members = memberStatsByCommunity.get(c.communityId) ?? [];
      const windowActivity = windowActivityByCommunity.get(c.communityId) ?? {
        senderCount: 0,
        senderCountPrev: 0,
        retainedSenders: 0,
        newMemberCount: 0,
        newMemberCountPrev: 0,
      };
      const weeklyRetention = weeklyRetentionByCommunity.get(c.communityId) ?? {
        retainedSenders: 0,
        churnedSenders: 0,
      };
      const latestCohort = latestCohortByCommunity.get(c.communityId) ?? {
        size: 0,
        activeAtM1: 0,
      };
      const hubMemberCount = hubMemberCountByCommunity.get(c.communityId) ?? 0;

      const stageCounts = computeStageCounts(members, thresholds);
      const tenureDistribution = computeTenureDistribution(members);
      const dormantCount = computeDormantCount(members, asOf, dormantThresholdDays);
      return AnalyticsPresenter.overviewRow({
        communityId: c.communityId,
        communityName: c.communityName,
        totalMembers: stageCounts.total,
        stageCounts,
        windowActivity,
        weeklyRetention,
        latestCohort,
        hubMemberCount,
        tenureDistribution,
        dormantCount,
      });
    });

    return AnalyticsPresenter.dashboard({
      asOf,
      platform,
      communities: rows,
    });
  }
}

function clampWindowDays(input: number | null | undefined): number {
  const n = input ?? DEFAULT_WINDOW_DAYS;
  return Math.min(Math.max(n, MIN_WINDOW_DAYS), MAX_WINDOW_DAYS);
}
