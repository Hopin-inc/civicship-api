import { inject, injectable } from "tsyringe";
import { IContext } from "@/types/server";
import { NotFoundError } from "@/errors/graphql";
import {
  GqlQueryAnalyticsCommunityArgs,
  GqlAnalyticsCommunityPayload,
} from "@/types/graphql";
import AnalyticsCommunityService, {
  DEFAULT_DORMANT_THRESHOLD_DAYS,
  DEFAULT_HUB_BREADTH_THRESHOLD,
  DEFAULT_WINDOW_MONTHS,
  MAX_DORMANT_THRESHOLD_DAYS,
  MAX_HUB_BREADTH_THRESHOLD,
  MAX_WINDOW_MONTHS,
  MIN_DORMANT_THRESHOLD_DAYS,
  MIN_HUB_BREADTH_THRESHOLD,
} from "@/application/domain/analytics/community/service";
import {
  DEFAULT_SEGMENT_THRESHOLDS,
  MAX_MIN_MONTHS_IN,
  MIN_MIN_MONTHS_IN,
  SegmentThresholds,
} from "@/application/domain/analytics/community/classifiers";
import {
  computeActivityRate3mAvg,
  computeCohortFunnel,
  computeDormantCount,
  computeStageBreakdown,
  computeStageCounts,
} from "@/application/domain/analytics/community/aggregations";
import { MAX_LIMIT, paginateMembers } from "@/application/domain/analytics/community/pagination";
import AnalyticsCommunityPresenter from "@/application/domain/analytics/community/presenter";
import AnalyticsCommunityConverter from "@/application/domain/analytics/community/data/converter";

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
    const asOf = input.asOf ?? new Date();
    const thresholds = resolveThresholds(input.segmentThresholds);
    const dormantThresholdDays = clampDormantThresholdDays(input.dormantThresholdDays);
    const hubBreadthThreshold = clampHubBreadthThreshold(input.hubBreadthThreshold);
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
    ]);

    const stageCounts = computeStageCounts(members, thresholds);
    const stageBreakdown = computeStageBreakdown(members, thresholds);
    const dormantCount = computeDormantCount(members, asOf, dormantThresholdDays);
    const cohortFunnel = computeCohortFunnel(members, asOf, windowMonths, thresholds);

    const alerts = await this.service.getAlerts(ctx, community.communityId, asOf);

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
    });
  }
}

function resolveThresholds(
  input:
    | {
        tier1?: number | null;
        tier2?: number | null;
        minMonthsIn?: number | null;
      }
    | null
    | undefined,
): SegmentThresholds {
  // Clamp negative inputs to 0 so the downstream invariant
  // `tier1 >= tier2 >= 0` holds. Without this, a negative tier2 would
  // make `userSendRate >= tier2` trivially true for every member and
  // produce misleading stage counts.
  const tier1 = Math.max(input?.tier1 ?? DEFAULT_SEGMENT_THRESHOLDS.tier1, 0);
  const tier2 = Math.max(input?.tier2 ?? DEFAULT_SEGMENT_THRESHOLDS.tier2, 0);
  // Clamp minMonthsIn to [MIN, MAX]. Default 1 preserves pre-issue-918
  // behaviour (no tenure filter); portal opts in to a stricter
  // classification by passing 3+. Hard ceiling 120 prevents an
  // accidental "minMonthsIn = 9999" that classifies every member as
  // ineligible.
  const minMonthsIn = Math.min(
    Math.max(input?.minMonthsIn ?? DEFAULT_SEGMENT_THRESHOLDS.minMonthsIn, MIN_MIN_MONTHS_IN),
    MAX_MIN_MONTHS_IN,
  );
  // If a caller flips them (tier2 > tier1), swap silently rather than
  // erroring — the "higher boundary" invariant is what the rest of the
  // service relies on, and a swap is a less confusing DX than a 400.
  return tier1 >= tier2
    ? { tier1, tier2, minMonthsIn }
    : { tier1: tier2, tier2: tier1, minMonthsIn };
}

function clampLimit(limit: number | null | undefined): number {
  const n = limit ?? 50;
  return Math.min(Math.max(n, 1), MAX_LIMIT);
}

/**
 * Hub-classification breadth threshold, in distinct DONATION
 * recipients within the parametric window. Defaults to 3 when
 * omitted, and clamped to
 * [MIN_HUB_BREADTH_THRESHOLD, MAX_HUB_BREADTH_THRESHOLD] so a
 * malformed/hostile input can't disable hub classification entirely
 * (negative threshold) or scan-stall the comparison (gigantic
 * threshold). Documented in the AnalyticsDashboardInput
 * .hubBreadthThreshold SDL description.
 */
function clampHubBreadthThreshold(input: number | null | undefined): number {
  const n = input ?? DEFAULT_HUB_BREADTH_THRESHOLD;
  return Math.min(Math.max(n, MIN_HUB_BREADTH_THRESHOLD), MAX_HUB_BREADTH_THRESHOLD);
}

/**
 * Days-of-silence threshold for the dormant-vs-active distinction.
 * Defaults to DEFAULT_DORMANT_THRESHOLD_DAYS when omitted, and
 * clamped to [MIN_DORMANT_THRESHOLD_DAYS, MAX_DORMANT_THRESHOLD_DAYS]
 * so a malformed/hostile input can't classify every member as
 * dormant (negative threshold) or none of them (gigantic threshold).
 * Documented in the AnalyticsDashboardInput.dormantThresholdDays SDL
 * description.
 */
function clampDormantThresholdDays(input: number | null | undefined): number {
  const n = input ?? DEFAULT_DORMANT_THRESHOLD_DAYS;
  return Math.min(Math.max(n, MIN_DORMANT_THRESHOLD_DAYS), MAX_DORMANT_THRESHOLD_DAYS);
}
