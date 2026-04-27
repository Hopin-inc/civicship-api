import { inject, injectable } from "tsyringe";
import { IContext } from "@/types/server";
import { NotFoundError } from "@/errors/graphql";
import {
  GqlQuerySysAdminCommunityDetailArgs,
  GqlQuerySysAdminDashboardArgs,
  GqlSysAdminCommunityDetailPayload,
  GqlSysAdminCommunityOverview,
  GqlSysAdminDashboardPayload,
} from "@/types/graphql";
import SysAdminService, {
  DEFAULT_DORMANT_THRESHOLD_DAYS,
  DEFAULT_HUB_BREADTH_THRESHOLD,
  DEFAULT_SEGMENT_THRESHOLDS,
  DEFAULT_WINDOW_DAYS,
  DEFAULT_WINDOW_MONTHS,
  MAX_DORMANT_THRESHOLD_DAYS,
  MAX_HUB_BREADTH_THRESHOLD,
  MAX_LIMIT,
  MAX_MIN_MONTHS_IN,
  MAX_WINDOW_DAYS,
  MAX_WINDOW_MONTHS,
  MIN_DORMANT_THRESHOLD_DAYS,
  MIN_HUB_BREADTH_THRESHOLD,
  MIN_MIN_MONTHS_IN,
  MIN_WINDOW_DAYS,
  SegmentThresholds,
} from "@/application/domain/sysadmin/service";
import SysAdminPresenter from "@/application/domain/sysadmin/presenter";
import { jstMonthStart, jstNextMonthStart } from "@/application/domain/report/util";
import { asOfBounds } from "@/application/domain/sysadmin/bounds";

@injectable()
export default class SysAdminUseCase {
  // Only the service is injected. Per CLAUDE.md the UseCase layer
  // must not talk to the repository directly — repository reads are
  // routed through SysAdminService's `get*` pass-throughs.
  constructor(@inject("SysAdminService") private readonly service: SysAdminService) {}

  /**
   * L1 dashboard: platform totals + one row per community.
   *
   * Fan-out is N in-process calls. At today's community count (~6)
   * this is cheaper than a new bulk repository method; revisit once
   * the platform exceeds ~20 communities (documented in the spec).
   */
  async getDashboard(
    { input }: GqlQuerySysAdminDashboardArgs,
    ctx: IContext,
  ): Promise<GqlSysAdminDashboardPayload> {
    const asOf = input?.asOf ?? new Date();
    const thresholds = resolveThresholds(input?.segmentThresholds);
    const windowDays = clampWindowDays(input?.windowDays);
    const hubBreadthThreshold = clampHubBreadthThreshold(input?.hubBreadthThreshold);
    const dormantThresholdDays = clampDormantThresholdDays(input?.dormantThresholdDays);

    const monthStart = jstMonthStart(asOf);
    // Clamp the platform-totals upper bound at asOf+1 JST day so a
    // mid-month or historic asOf doesn't count memberships that
    // hadn't been created yet. findPlatformTotals applies
    // `created_at < upper` on t_memberships; asOfBounds.clampFuture
    // collapses back to next_month_start for past months.
    const platformUpperBound = asOfBounds(asOf).clampFuture(jstNextMonthStart(asOf));

    const [platform, communities] = await Promise.all([
      this.service.getPlatformTotals(ctx, monthStart, platformUpperBound),
      this.service.getAllCommunities(ctx),
    ]);

    const rows = await Promise.all(
      communities.map(async (c): Promise<GqlSysAdminCommunityOverview> => {
        const [members, windowActivity, weeklyRetention, latestCohort, hubMemberCount] =
          await Promise.all([
            this.service.getMemberStats(ctx, c.communityId, asOf),
            this.service.getWindowActivity(ctx, c.communityId, asOf, windowDays),
            this.service.getWeeklyRetention(ctx, c.communityId, asOf),
            this.service.getLatestCohort(ctx, c.communityId, asOf),
            this.service.getWindowHubMemberCount(
              ctx,
              c.communityId,
              asOf,
              windowDays,
              hubBreadthThreshold,
            ),
          ]);
        const stageCounts = this.service.computeStageCounts(members, thresholds);
        const tenureDistribution = this.service.computeTenureDistribution(members);
        const dormantCount = this.service.computeDormantCount(
          members,
          asOf,
          dormantThresholdDays,
        );
        return SysAdminPresenter.overviewRow({
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

    // Sorting moved to the client. The L1 payload no longer carries
    // a single canonical "rate" the server can sort on, and the
    // browser's filter()/sort() over <100 rows is sub-millisecond.
    // Rows are returned in `findAllCommunities` order (community
    // name ASC, see SysAdminRepository) so the response is
    // deterministic before the client applies its own sort.

    return SysAdminPresenter.dashboard({
      asOf,
      platform,
      communities: rows,
    });
  }

  /**
   * L2 detail: summary card + stage breakdown + trailing-window trends
   * + cohort retention + paginated member list + alerts for one
   * community.
   */
  async getCommunityDetail(
    { input }: GqlQuerySysAdminCommunityDetailArgs,
    ctx: IContext,
  ): Promise<GqlSysAdminCommunityDetailPayload> {
    const asOf = input.asOf ?? new Date();
    const thresholds = resolveThresholds(input.segmentThresholds);
    const dormantThresholdDays = clampDormantThresholdDays(input.dormantThresholdDays);
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
      this.service.getMonthlyActivity(ctx, community.communityId, asOf, windowMonths),
      this.service.getAllTimeTotals(ctx, community.communityId, asOf),
      this.service.getMonthActivityWithPrev(ctx, community.communityId, asOf),
      this.service.getRetentionTrend(ctx, community.communityId, asOf, windowMonths),
      this.service.getCohortRetention(ctx, community.communityId, asOf, windowMonths),
      this.service.getChainDepthDistribution(ctx, community.communityId, asOf),
    ]);

    const stageCounts = this.service.computeStageCounts(members, thresholds);
    const stageBreakdown = this.service.computeStageBreakdown(members, thresholds);
    const dormantCount = this.service.computeDormantCount(members, asOf, dormantThresholdDays);

    const alerts = await this.service.getAlerts(ctx, community.communityId, asOf);

    const memberList = this.service.paginateMembers(members, {
      minSendRate: input.userFilter?.minSendRate ?? 0.7,
      maxSendRate: input.userFilter?.maxSendRate ?? null,
      minMonthsIn: input.userFilter?.minMonthsIn ?? null,
      minDonationOutMonths: input.userFilter?.minDonationOutMonths ?? null,
      sortField: input.userSort?.field ?? "SEND_RATE",
      sortOrder: input.userSort?.order ?? "DESC",
      limit: clampLimit(input.limit),
      cursor: input.cursor ?? null,
    });

    const summary = SysAdminPresenter.summaryCard({
      communityId: community.communityId,
      communityName: community.communityName,
      totalMembers: stageCounts.total,
      communityActivityRate: currentMonthActivity.currentRate,
      communityActivityRate3mAvg: this.service.computeActivityRate3mAvg(monthlyActivity),
      growthRateActivity: currentMonthActivity.growthRateActivity,
      tier2Count: stageCounts.tier2Count,
      allTimeTotals,
    });

    return SysAdminPresenter.communityDetail({
      communityId: community.communityId,
      communityName: community.communityName,
      asOf,
      windowMonths,
      summary,
      stages: SysAdminPresenter.stages(stageBreakdown),
      monthlyActivityTrend: monthlyActivity.map(SysAdminPresenter.monthlyActivityPoint),
      retentionTrend: retentionTrend.map(SysAdminPresenter.retentionTrendPoint),
      cohortRetention: cohortRetention.map(SysAdminPresenter.cohortPoint),
      memberList: SysAdminPresenter.memberList(memberList),
      alerts: SysAdminPresenter.alerts(alerts),
      dormantCount,
      chainDepthDistribution,
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
 * L1 dashboard activity-window length, in JST days. Defaults to 28
 * (= 4 weeks) when omitted, and is silently clamped to
 * [MIN_WINDOW_DAYS, MAX_WINDOW_DAYS] so a malformed/hostile input can't
 * fan the per-community DB scan out to year-long ranges. Documented in
 * the SysAdminDashboardInput.windowDays SDL description.
 */
function clampWindowDays(input: number | null | undefined): number {
  const n = input ?? DEFAULT_WINDOW_DAYS;
  return Math.min(Math.max(n, MIN_WINDOW_DAYS), MAX_WINDOW_DAYS);
}

/**
 * Hub-classification breadth threshold, in distinct DONATION
 * recipients within the parametric window. Defaults to 3 when
 * omitted, and clamped to
 * [MIN_HUB_BREADTH_THRESHOLD, MAX_HUB_BREADTH_THRESHOLD] so a
 * malformed/hostile input can't disable hub classification entirely
 * (negative threshold) or scan-stall the comparison (gigantic
 * threshold). Documented in the SysAdminDashboardInput
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
 * Documented in the SysAdminDashboardInput.dormantThresholdDays SDL
 * description.
 */
function clampDormantThresholdDays(input: number | null | undefined): number {
  const n = input ?? DEFAULT_DORMANT_THRESHOLD_DAYS;
  return Math.min(Math.max(n, MIN_DORMANT_THRESHOLD_DAYS), MAX_DORMANT_THRESHOLD_DAYS);
}
