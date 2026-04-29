import { inject, injectable } from "tsyringe";
import { IContext } from "@/types/server";
import {
  GqlAnalyticsCommunityOverview,
  GqlAnalyticsDashboardPayload,
  GqlQueryAnalyticsDashboardArgs,
} from "@/types/graphql";
import AnalyticsCommunityService, {
  DEFAULT_DORMANT_THRESHOLD_DAYS,
  DEFAULT_HUB_BREADTH_THRESHOLD,
  MAX_DORMANT_THRESHOLD_DAYS,
  MAX_HUB_BREADTH_THRESHOLD,
  MIN_DORMANT_THRESHOLD_DAYS,
  MIN_HUB_BREADTH_THRESHOLD,
} from "@/application/domain/analytics/community/service";
import AnalyticsPlatformService from "@/application/domain/analytics/platform/service";
import {
  DEFAULT_SEGMENT_THRESHOLDS,
  MAX_MIN_MONTHS_IN,
  MIN_MIN_MONTHS_IN,
  SegmentThresholds,
} from "@/application/domain/analytics/community/classifiers";
import {
  computeDormantCount,
  computeStageCounts,
  computeTenureDistribution,
} from "@/application/domain/analytics/community/aggregations";
import AnalyticsPresenter from "@/application/domain/analytics/presenter";
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
    const thresholds = resolveThresholds(input?.segmentThresholds);
    const windowDays = clampWindowDays(input?.windowDays);
    const hubBreadthThreshold = clampHubBreadthThreshold(input?.hubBreadthThreshold);
    const dormantThresholdDays = clampDormantThresholdDays(input?.dormantThresholdDays);

    const monthStart = jstMonthStart(asOf);
    const platformUpperBound = asOfBounds(asOf).clampFuture(jstNextMonthStart(asOf));

    const [platform, communities] = await Promise.all([
      this.platformService.getPlatformTotals(ctx, monthStart, platformUpperBound),
      this.communityService.getAllCommunities(ctx),
    ]);

    const rows = await Promise.all(
      communities.map(async (c): Promise<GqlAnalyticsCommunityOverview> => {
        const [members, windowActivity, weeklyRetention, latestCohort, hubMemberCount] =
          await Promise.all([
            this.communityService.getMemberStats(ctx, c.communityId, asOf),
            this.communityService.getWindowActivity(ctx, c.communityId, asOf, windowDays),
            this.communityService.getWeeklyRetention(ctx, c.communityId, asOf),
            this.communityService.getLatestCohort(ctx, c.communityId, asOf),
            this.communityService.getWindowHubMemberCount(
              ctx,
              c.communityId,
              asOf,
              windowDays,
              hubBreadthThreshold,
            ),
          ]);
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
      }),
    );

    return AnalyticsPresenter.dashboard({
      asOf,
      platform,
      communities: rows,
    });
  }
}

function resolveThresholds(
  input:
    | { tier1?: number | null; tier2?: number | null; minMonthsIn?: number | null }
    | null
    | undefined,
): SegmentThresholds {
  if (!input) return DEFAULT_SEGMENT_THRESHOLDS;
  const tier1 = input.tier1 ?? DEFAULT_SEGMENT_THRESHOLDS.tier1;
  const tier2 = input.tier2 ?? DEFAULT_SEGMENT_THRESHOLDS.tier2;
  const minMonthsIn = Math.min(
    Math.max(input.minMonthsIn ?? DEFAULT_SEGMENT_THRESHOLDS.minMonthsIn, MIN_MIN_MONTHS_IN),
    MAX_MIN_MONTHS_IN,
  );
  return { tier1, tier2, minMonthsIn };
}

function clampWindowDays(input: number | null | undefined): number {
  const n = input ?? DEFAULT_WINDOW_DAYS;
  return Math.min(Math.max(n, MIN_WINDOW_DAYS), MAX_WINDOW_DAYS);
}

function clampHubBreadthThreshold(input: number | null | undefined): number {
  const n = input ?? DEFAULT_HUB_BREADTH_THRESHOLD;
  return Math.min(Math.max(n, MIN_HUB_BREADTH_THRESHOLD), MAX_HUB_BREADTH_THRESHOLD);
}

function clampDormantThresholdDays(input: number | null | undefined): number {
  const n = input ?? DEFAULT_DORMANT_THRESHOLD_DAYS;
  return Math.min(Math.max(n, MIN_DORMANT_THRESHOLD_DAYS), MAX_DORMANT_THRESHOLD_DAYS);
}
