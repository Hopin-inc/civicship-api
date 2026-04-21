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
  DEFAULT_SEGMENT_THRESHOLDS,
  DEFAULT_WINDOW_MONTHS,
  MAX_LIMIT,
  MAX_WINDOW_MONTHS,
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
        const [members, currentMonthActivity, latestCohortRetentionM1] = await Promise.all([
          this.service.getMemberStats(ctx, c.communityId, asOf),
          this.service.getMonthActivityWithPrev(ctx, c.communityId, asOf),
          this.service.getLatestCohortRetentionM1(ctx, c.communityId, asOf),
        ]);
        const stageCounts = this.service.computeStageCounts(members, thresholds);
        const alerts = await this.service.getAlerts(
          ctx,
          c.communityId,
          asOf,
          currentMonthActivity.growthRateActivity,
        );
        return SysAdminPresenter.overviewRow({
          communityId: c.communityId,
          communityName: c.communityName,
          totalMembers: stageCounts.total,
          stageCounts,
          communityActivityRate: currentMonthActivity.currentRate,
          growthRateActivity: currentMonthActivity.growthRateActivity,
          latestCohortRetentionM1,
          alerts,
        });
      }),
    );

    // Sort by latest-month communityActivityRate descending — matches
    // the "ソート: 直近月の community_activity_rate 降順（デフォルト）"
    // behaviour in the requirement doc. Clients can still re-sort in
    // the browser since the payload is small.
    rows.sort((a, b) => b.communityActivityRate - a.communityActivityRate);

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
    ] = await Promise.all([
      this.service.getMemberStats(ctx, community.communityId, asOf),
      this.service.getMonthlyActivity(ctx, community.communityId, asOf, windowMonths),
      this.service.getAllTimeTotals(ctx, community.communityId, asOf),
      this.service.getMonthActivityWithPrev(ctx, community.communityId, asOf),
      this.service.getRetentionTrend(ctx, community.communityId, asOf, windowMonths),
      this.service.getCohortRetention(ctx, community.communityId, asOf, windowMonths),
    ]);

    const stageCounts = this.service.computeStageCounts(members, thresholds);
    const stageBreakdown = this.service.computeStageBreakdown(members, thresholds);

    const alerts = await this.service.getAlerts(
      ctx,
      community.communityId,
      asOf,
      currentMonthActivity.growthRateActivity,
    );

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
    });
  }
}

function resolveThresholds(
  input:
    | {
        tier1?: number | null;
        tier2?: number | null;
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
  // If a caller flips them (tier2 > tier1), swap silently rather than
  // erroring — the "higher boundary" invariant is what the rest of the
  // service relies on, and a swap is a less confusing DX than a 400.
  return tier1 >= tier2 ? { tier1, tier2 } : { tier1: tier2, tier2: tier1 };
}

function clampLimit(limit: number | null | undefined): number {
  const n = limit ?? 50;
  return Math.min(Math.max(n, 1), MAX_LIMIT);
}
