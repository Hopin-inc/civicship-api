import { inject, injectable } from "tsyringe";
import { IContext } from "@/types/server";
import { AuthorizationError, NotFoundError } from "@/errors/graphql";
import {
  GqlQueryAnalyticsCommunityArgs,
  GqlAnalyticsChainDepthBucket,
  GqlAnalyticsCohortFunnelPoint,
  GqlAnalyticsCohortRetentionPoint,
  GqlAnalyticsCommunityAlerts,
  GqlAnalyticsCommunitySummaryCard,
  GqlAnalyticsMemberList,
  GqlAnalyticsMonthlyActivityPoint,
  GqlAnalyticsRetentionTrendPoint,
  GqlAnalyticsStageDistribution,
  GqlAnalyticsTenureDistribution,
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
import {
  MAX_LIMIT,
  MemberListParams,
  paginateMembers,
} from "@/application/domain/analytics/community/pagination";
import {
  AnalyticsMemberStatsRow,
  AnalyticsMonthlyActivityRow,
} from "@/application/domain/analytics/community/data/type";
import AnalyticsCommunityPresenter from "@/application/domain/analytics/community/presenter";
import AnalyticsCommunityConverter from "@/application/domain/analytics/community/data/converter";
import AnalyticsConverter from "@/application/domain/analytics/data/converter";

type SegmentThresholds = ReturnType<typeof AnalyticsConverter.resolveThresholds>;

/**
 * Lazily-resolved root for `analyticsCommunity`. The Query resolver
 * returns this immediately (after the cheap auth + 404 + community-row
 * checks); each expensive section becomes a field resolver on
 * `AnalyticsCommunityPayload` that runs ONLY when the client selects
 * that field.
 *
 * Before this split the usecase eagerly `Promise.all`-ed all ~9
 * sections on every call — including the retention-trend
 * (~windowMonths×4.3 weeks × 2 queries) and cohort-retention
 * (~windowMonths × 4 queries) fan-outs — even when the caller asked
 * only for `summary`. Mobile clients that render the summary card
 * first now skip those ~120 SQL round-trips entirely.
 *
 * `loadMembers` / `loadMonthlyActivity` are request-scoped memoised
 * loaders: several fields (summary, stages, memberList, dormantCount,
 * cohortFunnel, tenureDistribution all read `members`) share the same
 * underlying query, so the memo keeps a multi-field selection set from
 * re-running the member-stats / monthly-activity SQL per field.
 */
export interface AnalyticsCommunityRoot {
  communityId: string;
  communityName: string;
  asOf: Date;
  windowMonths: number;
  thresholds: SegmentThresholds;
  dormantThresholdDays: number;
  hubBreadthThreshold: number;
  memberListParams: MemberListParams;
  loadMembers: () => Promise<AnalyticsMemberStatsRow[]>;
  loadMonthlyActivity: () => Promise<AnalyticsMonthlyActivityRow[]>;
}

/**
 * Memoise a zero-arg async thunk so repeated calls within one request
 * share a single in-flight promise. Inlined rather than reaching for a
 * library — the analytics root is the only caller.
 */
function once<T>(fn: () => Promise<T>): () => Promise<T> {
  let cached: Promise<T> | undefined;
  return () => (cached ??= fn());
}

@injectable()
export default class AnalyticsCommunityUseCase {
  // Only the service is injected. Per CLAUDE.md the UseCase layer
  // must not talk to the repository directly — repository reads are
  // routed through AnalyticsCommunityService's `get*` pass-throughs.
  constructor(@inject("AnalyticsCommunityService") private readonly service: AnalyticsCommunityService) {}

  /**
   * L2 detail entry point. Resolves only the cheap, always-needed bits
   * eagerly (authorization scope check, 404, community name) and returns
   * a lazy root. The expensive sections are computed by the
   * `AnalyticsCommunityPayload` field resolvers below, driven by the
   * client's selection set.
   */
  async getCommunity(
    { input }: GqlQueryAnalyticsCommunityArgs,
    ctx: IContext,
  ): Promise<AnalyticsCommunityRoot> {
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

    const communityId = community.communityId;
    const memberListParams: MemberListParams = {
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
    };

    return {
      communityId,
      communityName: community.communityName,
      asOf,
      windowMonths,
      thresholds,
      dormantThresholdDays,
      hubBreadthThreshold,
      memberListParams,
      // ctx is the same instance for every field resolver of this
      // query, so binding it into the memoised loaders here is safe.
      loadMembers: once(() => this.service.getMemberStats(ctx, communityId, asOf)),
      loadMonthlyActivity: once(() =>
        this.service.getMonthlyActivity(
          ctx,
          communityId,
          asOf,
          windowMonths,
          hubBreadthThreshold,
        ),
      ),
    };
  }

  // ==========================================================================
  // Field resolvers for AnalyticsCommunityPayload — each runs only when
  // the client selects the matching field. Shared reads (members,
  // monthly activity) go through the root's memoised loaders so a
  // multi-field selection issues each underlying query at most once.
  // ==========================================================================

  /**
   * Summary card. Reads the shared member + monthly-activity loaders and
   * fires the two summary-only queries (all-time totals, month-over-month
   * activity) in parallel.
   */
  async summary(
    root: AnalyticsCommunityRoot,
    ctx: IContext,
  ): Promise<GqlAnalyticsCommunitySummaryCard> {
    const [members, monthlyActivity, allTimeTotals, currentMonthActivity] = await Promise.all([
      root.loadMembers(),
      root.loadMonthlyActivity(),
      this.service.getAllTimeTotals(ctx, root.communityId, root.asOf),
      this.service.getMonthActivityWithPrev(ctx, root.communityId, root.asOf),
    ]);
    const stageCounts = computeStageCounts(members, root.thresholds);
    return AnalyticsCommunityPresenter.summaryCard({
      communityId: root.communityId,
      communityName: root.communityName,
      totalMembers: stageCounts.total,
      communityActivityRate: currentMonthActivity.currentRate,
      communityActivityRate3mAvg: computeActivityRate3mAvg(monthlyActivity),
      growthRateActivity: currentMonthActivity.growthRateActivity,
      tier2Count: stageCounts.tier2Count,
      allTimeTotals,
    });
  }

  async stages(root: AnalyticsCommunityRoot): Promise<GqlAnalyticsStageDistribution> {
    const members = await root.loadMembers();
    return AnalyticsCommunityPresenter.stages(computeStageBreakdown(members, root.thresholds));
  }

  async monthlyActivityTrend(
    root: AnalyticsCommunityRoot,
  ): Promise<GqlAnalyticsMonthlyActivityPoint[]> {
    const monthlyActivity = await root.loadMonthlyActivity();
    return monthlyActivity.map(AnalyticsCommunityPresenter.monthlyActivityPoint);
  }

  /**
   * Trailing-window weekly retention. The heaviest section: fans out
   * ~windowMonths×4.3 weeks × 2 SQL statements. Only runs when selected.
   */
  async retentionTrend(
    root: AnalyticsCommunityRoot,
    ctx: IContext,
  ): Promise<GqlAnalyticsRetentionTrendPoint[]> {
    const trend = await this.service.getRetentionTrend(
      ctx,
      root.communityId,
      root.asOf,
      root.windowMonths,
    );
    return trend.map(AnalyticsCommunityPresenter.retentionTrendPoint);
  }

  /**
   * Monthly cohort retention. Fans out ~windowMonths × 4 SQL
   * statements. Only runs when selected.
   */
  async cohortRetention(
    root: AnalyticsCommunityRoot,
    ctx: IContext,
  ): Promise<GqlAnalyticsCohortRetentionPoint[]> {
    const cohorts = await this.service.getCohortRetention(
      ctx,
      root.communityId,
      root.asOf,
      root.windowMonths,
    );
    return cohorts.map(AnalyticsCommunityPresenter.cohortPoint);
  }

  async memberList(root: AnalyticsCommunityRoot): Promise<GqlAnalyticsMemberList> {
    const members = await root.loadMembers();
    return AnalyticsCommunityPresenter.memberList(
      paginateMembers(members, root.memberListParams),
    );
  }

  async alerts(
    root: AnalyticsCommunityRoot,
    ctx: IContext,
  ): Promise<GqlAnalyticsCommunityAlerts> {
    return AnalyticsCommunityPresenter.alerts(
      await this.service.getAlerts(ctx, root.communityId, root.asOf),
    );
  }

  async dormantCount(root: AnalyticsCommunityRoot): Promise<number> {
    const members = await root.loadMembers();
    return computeDormantCount(members, root.asOf, root.dormantThresholdDays);
  }

  async chainDepthDistribution(
    root: AnalyticsCommunityRoot,
    ctx: IContext,
  ): Promise<GqlAnalyticsChainDepthBucket[]> {
    const rows = await this.service.getChainDepthDistribution(ctx, root.communityId, root.asOf);
    return AnalyticsCommunityPresenter.chainDepthDistribution(rows);
  }

  async cohortFunnel(root: AnalyticsCommunityRoot): Promise<GqlAnalyticsCohortFunnelPoint[]> {
    const members = await root.loadMembers();
    return AnalyticsCommunityPresenter.cohortFunnel(
      computeCohortFunnel(members, root.asOf, root.windowMonths, root.thresholds),
    );
  }

  async hubMemberCount(root: AnalyticsCommunityRoot, ctx: IContext): Promise<number> {
    // Fixed 28-day window matches L1's default `windowDays` so the L2
    // `hubMemberCount` reads directly comparable to L1 for the same
    // community + `hubBreadthThreshold`. L2's `windowMonths` input
    // drives trend-array length only, not hub classification.
    return this.service.getWindowHubMemberCount(
      ctx,
      root.communityId,
      root.asOf,
      DEFAULT_WINDOW_DAYS,
      root.hubBreadthThreshold,
    );
  }

  async tenureDistribution(
    root: AnalyticsCommunityRoot,
  ): Promise<GqlAnalyticsTenureDistribution> {
    const members = await root.loadMembers();
    return AnalyticsCommunityPresenter.tenureDistribution(computeTenureDistribution(members));
  }
}

function clampLimit(limit: number | null | undefined): number {
  const n = limit ?? 50;
  return Math.min(Math.max(n, 1), MAX_LIMIT);
}
