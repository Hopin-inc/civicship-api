import { inject, injectable } from "tsyringe";
import { IContext } from "@/types/server";
import { AuthorizationError, NotFoundError } from "@/errors/graphql";
import {
  GqlQueryAnalyticsCommunityArgs,
  GqlAnalyticsCommunityPayload,
} from "@/types/graphql";
import AnalyticsCommunityService, {
  DEFAULT_WINDOW_DAYS,
  DEFAULT_WINDOW_MONTHS,
  MAX_WINDOW_MONTHS,
} from "@/application/domain/analytics/community/service";
import {
  computeActivityRate3mAvg,
  computeCohortFunnel,
  computeDormantCount,
  computeStageBreakdown,
  computeStageCounts,
  computeTenureDistribution,
} from "@/application/domain/analytics/community/aggregations";
import { MAX_LIMIT, paginateMembers } from "@/application/domain/analytics/community/pagination";
import AnalyticsCommunityPresenter from "@/application/domain/analytics/community/presenter";
import AnalyticsCommunityConverter from "@/application/domain/analytics/community/data/converter";
import AnalyticsConverter from "@/application/domain/analytics/data/converter";

@injectable()
export default class AnalyticsCommunityUseCase {
  // Only the service is injected. Per CLAUDE.md the UseCase layer
  // must not talk to the repository directly — repository reads are
  // routed through AnalyticsCommunityService's `get*` pass-throughs.
  constructor(@inject("AnalyticsCommunityService") private readonly service: AnalyticsCommunityService) {}

  /**
   * L2 detail: summary card + stage breakdown + trailing-window trends
   * + cohort retention + paginated member list + alerts for one
   * community.
   */
  async getCommunity(
    { input }: GqlQueryAnalyticsCommunityArgs,
    ctx: IContext,
  ): Promise<GqlAnalyticsCommunityPayload> {
    // IsCommunityOwner verifies the caller owns `ctx.communityId` but
    // does not bind `input.communityId` to it — without this check an
    // owner of community A could read community B's analytics by
    // passing the foreign id. SYS_ADMIN bypasses scoping because the
    // role is cross-community by design.
    if (!ctx.isAdmin && input.communityId !== ctx.communityId) {
      throw new AuthorizationError("Community does not match the current scope");
    }

    const asOf = input.asOf ?? new Date();
    const thresholds = AnalyticsConverter.resolveThresholds(input.segmentThresholds);
    const dormantThresholdDays = AnalyticsConverter.clampDormantThresholdDays(
      input.dormantThresholdDays,
    );
    const hubBreadthThreshold = AnalyticsConverter.clampHubBreadthThreshold(
      input.hubBreadthThreshold,
    );
    // Clamp to [1, MAX_WINDOW_MONTHS]. getCohortRetention and the
    // retention-trend fan-out both scale linearly with this value, so
    // a cap prevents a single request from exhausting the connection
    // pool on unbounded input.
    const windowMonths = Math.min(
      Math.max(input.windowMonths ?? DEFAULT_WINDOW_MONTHS, 1),
      MAX_WINDOW_MONTHS,
    );

    // Resolve the community row first so we can 404 early if the id is
    // bogus and also thread communityName through the payload. The
    // id-indexed lookup keeps cost flat as the platform grows.
    const community = await this.service.getCommunityById(ctx, input.communityId);
    if (!community) {
      throw new NotFoundError("Community", { id: input.communityId });
    }

    const [
      members,
      monthlyActivity,
      allTimeTotals,
      currentMonthActivity,
      retentionTrend,
      cohortRetention,
      chainDepthDistribution,
      alerts,
      hubMemberCount,
    ] = await Promise.all([
      this.service.getMemberStats(ctx, community.communityId, asOf),
      this.service.getMonthlyActivity(
        ctx,
        community.communityId,
        asOf,
        windowMonths,
        hubBreadthThreshold,
      ),
      this.service.getAllTimeTotals(ctx, community.communityId, asOf),
      this.service.getMonthActivityWithPrev(ctx, community.communityId, asOf),
      this.service.getRetentionTrend(ctx, community.communityId, asOf, windowMonths),
      this.service.getCohortRetention(ctx, community.communityId, asOf, windowMonths),
      this.service.getChainDepthDistribution(ctx, community.communityId, asOf),
      this.service.getAlerts(ctx, community.communityId, asOf),
      // Fixed 28-day window matches L1's default `windowDays` so the
      // L2 `hubMemberCount` reads directly comparable to L1 for the
      // same community + `hubBreadthThreshold`. L2's `windowMonths`
      // input drives trend-array length only, not hub classification.
      this.service.getWindowHubMemberCount(
        ctx,
        community.communityId,
        asOf,
        DEFAULT_WINDOW_DAYS,
        hubBreadthThreshold,
      ),
    ]);

    const stageCounts = computeStageCounts(members, thresholds);
    const stageBreakdown = computeStageBreakdown(members, thresholds);
    const dormantCount = computeDormantCount(members, asOf, dormantThresholdDays);
    const cohortFunnel = computeCohortFunnel(members, asOf, windowMonths, thresholds);
    const tenureDistribution = computeTenureDistribution(members);

    const memberList = paginateMembers(members, {
      minSendRate: input.userFilter?.minSendRate ?? 0.7,
      maxSendRate: input.userFilter?.maxSendRate ?? null,
      minMonthsIn: input.userFilter?.minMonthsIn ?? null,
      minDonationOutMonths: input.userFilter?.minDonationOutMonths ?? null,
      sortField: input.userSort?.field ?? "SEND_RATE",
      sortOrder: input.userSort?.order ?? "DESC",
      limit: clampLimit(input.limit),
      // Decode at the converter boundary so service operates on a
      // numeric offset only — no wire-format leakage.
      cursor: AnalyticsCommunityConverter.parseMemberListCursor(input.cursor),
    });

    const summary = AnalyticsCommunityPresenter.summaryCard({
      communityId: community.communityId,
      communityName: community.communityName,
      totalMembers: stageCounts.total,
      communityActivityRate: currentMonthActivity.currentRate,
      communityActivityRate3mAvg: computeActivityRate3mAvg(monthlyActivity),
      growthRateActivity: currentMonthActivity.growthRateActivity,
      tier2Count: stageCounts.tier2Count,
      allTimeTotals,
    });

    return AnalyticsCommunityPresenter.communityDetail({
      communityId: community.communityId,
      communityName: community.communityName,
      asOf,
      windowMonths,
      summary,
      stages: AnalyticsCommunityPresenter.stages(stageBreakdown),
      monthlyActivityTrend: monthlyActivity.map(AnalyticsCommunityPresenter.monthlyActivityPoint),
      retentionTrend: retentionTrend.map(AnalyticsCommunityPresenter.retentionTrendPoint),
      cohortRetention: cohortRetention.map(AnalyticsCommunityPresenter.cohortPoint),
      memberList: AnalyticsCommunityPresenter.memberList(memberList),
      alerts: AnalyticsCommunityPresenter.alerts(alerts),
      dormantCount,
      chainDepthDistribution,
      cohortFunnel,
      hubMemberCount,
      tenureDistribution,
    });
  }
}

function clampLimit(limit: number | null | undefined): number {
  const n = limit ?? 50;
  return Math.min(Math.max(n, 1), MAX_LIMIT);
}
