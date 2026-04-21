import { inject, injectable } from "tsyringe";
import { IContext } from "@/types/server";
import { ISysAdminRepository } from "@/application/domain/sysadmin/data/interface";
import ReportService from "@/application/domain/report/service";
import {
  SysAdminMemberStatsRow,
  SysAdminMonthlyActivityRow,
} from "@/application/domain/sysadmin/data/type";
import {
  addDays,
  bigintToSafeNumber,
  isoWeekStartJst,
  jstMonthStart,
  jstMonthStartOffset,
  jstNextMonthStart,
  percentChange,
} from "@/application/domain/report/util";
import { asOfBounds } from "@/application/domain/sysadmin/bounds";

/**
 * Stage-count thresholds come from the client. tier1 >= tier2 >= 0 is
 * enforced at the service boundary so the cumulative-count invariant
 * (`tier2Count >= tier1Count`) is guaranteed downstream.
 */
export type SegmentThresholds = {
  tier1: number;
  tier2: number;
};

export const DEFAULT_SEGMENT_THRESHOLDS: SegmentThresholds = {
  tier1: 0.7,
  tier2: 0.4,
};

/**
 * Result of classifying a community's members against the supplied
 * thresholds. `tier2Count` and `tier1Count` are cumulative (tier2
 * INCLUDES tier1 members); the per-bucket breakdown lives in
 * `stageBreakdown` below so both shapes are available without a second
 * scan.
 */
export type StageCounts = {
  total: number;
  tier1Count: number;
  tier2Count: number;
  activeCount: number;
  passiveCount: number;
};

export type StageBucketStats = {
  count: number;
  pct: number;
  pointsContributionPct: number;
  avgSendRate: number;
  avgMonthsIn: number;
};

export type StageBreakdown = {
  habitual: StageBucketStats;
  regular: StageBucketStats;
  occasional: StageBucketStats;
  latent: StageBucketStats;
};

export type WeeklyRetentionPoint = {
  weekStart: Date;
  retainedSenders: number;
  churnedSenders: number;
  returnedSenders: number;
  newMembers: number;
  communityActivityRate: number | null;
};

export type MonthlyCohortPoint = {
  cohortMonthStart: Date;
  cohortSize: number;
  retentionM1: number | null;
  retentionM3: number | null;
  retentionM6: number | null;
};

export type SortField = "SEND_RATE" | "MONTHS_IN" | "DONATION_OUT_MONTHS" | "TOTAL_POINTS_OUT";
export type SortOrder = "ASC" | "DESC";

export type MemberListParams = {
  minSendRate?: number | null;
  maxSendRate?: number | null;
  minMonthsIn?: number | null;
  minDonationOutMonths?: number | null;
  sortField: SortField;
  sortOrder: SortOrder;
  limit: number;
  cursor?: string | null;
};

export type MemberListResult = {
  users: SysAdminMemberStatsRow[];
  hasNextPage: boolean;
  nextCursor: string | null;
};

export type AlertFlags = {
  churnSpike: boolean;
  activeDrop: boolean;
  noNewMembers: boolean;
};

/**
 * Return shape of `getMonthActivityWithPrev`. Flat, not nested, because
 * every caller only reads the current-month fields plus the derived
 * `growthRateActivity`; keeping a `previous` sub-tree around was dead
 * payload that tempted readers to assume the previous-month snapshot
 * was part of the API contract.
 */
export type MonthActivityWithPrev = {
  currentRate: number;
  currentSenderCount: number;
  currentTotalMembers: number;
  growthRateActivity: number | null;
};

export const DEFAULT_WINDOW_MONTHS = 10;
/**
 * Upper bound on `windowMonths`. Defensive guard against a caller
 * (or a tampered persisted query) requesting an unreasonably long
 * trend — `getCohortRetention` fires 4 SQL calls per month in the
 * window, so unbounded input would let a single request fan out
 * arbitrarily. 36 months (3 years) comfortably covers every
 * analytics need the spec references today.
 */
export const MAX_WINDOW_MONTHS = 36;
export const MAX_LIMIT = 200;
export const ACTIVE_DROP_THRESHOLD = -0.2; // month-over-month fraction
export const NO_NEW_MEMBERS_WINDOW_DAYS = 14;

/**
 * Cap on how many DB round-trips the retention-trend and cohort-
 * retention orchestrators will keep in flight at once. At the MAX
 * windowMonths (36) those loops otherwise fan out to ~310 concurrent
 * `$queryRaw` calls (each under its own `ctx.issuer.public` tx),
 * which can exhaust the Prisma connection pool and stall the whole
 * request. Keep the degree of concurrency small — bench measurements
 * showed Postgres handles per-week scans in ~1ms each, so serialising
 * chunks adds only a few ms of wall-clock latency.
 */
export const FANOUT_CONCURRENCY = 8;

/**
 * Run `fn(item)` across `items` with a bounded number of in-flight
 * promises. Returns results in the same order as `items`. No library
 * dependency — the loop is short enough to inline rather than reach
 * for `p-limit`.
 */
async function runBatched<T, R>(
  items: readonly T[],
  batchSize: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const chunk = items.slice(i, i + batchSize);
    const chunkResults = await Promise.all(chunk.map(fn));
    results.push(...chunkResults);
  }
  return results;
}

@injectable()
export default class SysAdminService {
  constructor(
    @inject("SysAdminRepository") private readonly repository: ISysAdminRepository,
    // Cross-domain reads route through ReportService (the report
    // domain's service-layer entry point), not the report repository.
    // CLAUDE.md restricts services to "Call other domain services
    // (read operations only)" — going straight to the repository
    // would couple sysadmin to the report domain's data layer.
    @inject("ReportService") private readonly reportService: ReportService,
  ) {}

  // ==========================================================================
  // Pure classification / aggregation helpers
  //
  // Split out from the orchestrator methods below so they're easy to
  // unit-test without any database or context plumbing. Every one is a
  // pure function of `members`, `thresholds`, and (for alerts) the
  // pre-fetched rows.
  // ==========================================================================

  computeStageCounts(
    members: SysAdminMemberStatsRow[],
    thresholds: SegmentThresholds,
  ): StageCounts {
    const total = members.length;
    let tier1Count = 0;
    let tier2Count = 0;
    let activeCount = 0;
    let passiveCount = 0;
    for (const m of members) {
      if (m.donationOutMonths === 0) {
        passiveCount++;
        continue;
      }
      activeCount++;
      if (m.userSendRate >= thresholds.tier1) tier1Count++;
      if (m.userSendRate >= thresholds.tier2) tier2Count++;
    }
    return { total, tier1Count, tier2Count, activeCount, passiveCount };
  }

  /**
   * Four-bucket stage breakdown. Unlike `computeStageCounts` these
   * buckets are disjoint (`habitual`, `regular`, `occasional`, `latent`)
   * so `pct` sums to 1.0. `pointsContributionPct` is the share of the
   * community's total DONATION points-out attributed to each bucket.
   */
  computeStageBreakdown(
    members: SysAdminMemberStatsRow[],
    thresholds: SegmentThresholds,
  ): StageBreakdown {
    const totalMembers = members.length;
    const totalPointsOut = members.reduce<bigint>((acc, m) => acc + m.totalPointsOut, BigInt(0));

    const buckets = {
      habitual: [] as SysAdminMemberStatsRow[],
      regular: [] as SysAdminMemberStatsRow[],
      occasional: [] as SysAdminMemberStatsRow[],
      latent: [] as SysAdminMemberStatsRow[],
    };
    for (const m of members) {
      if (m.donationOutMonths === 0) {
        buckets.latent.push(m);
      } else if (m.userSendRate >= thresholds.tier1) {
        buckets.habitual.push(m);
      } else if (m.userSendRate >= thresholds.tier2) {
        buckets.regular.push(m);
      } else {
        buckets.occasional.push(m);
      }
    }

    const summarize = (rows: SysAdminMemberStatsRow[]): StageBucketStats => {
      const count = rows.length;
      if (count === 0) {
        return {
          count: 0,
          pct: 0,
          pointsContributionPct: 0,
          avgSendRate: 0,
          avgMonthsIn: 0,
        };
      }
      // Single-pass reduce over rows so we visit the bucket once
      // instead of three times. At realistic bucket sizes the
      // difference is negligible, but it keeps the intent ("summarise
      // this bucket") in one place.
      const { sumSendRate, sumMonthsIn, sumPointsOut } = rows.reduce(
        (acc, r) => ({
          sumSendRate: acc.sumSendRate + r.userSendRate,
          sumMonthsIn: acc.sumMonthsIn + r.monthsIn,
          sumPointsOut: acc.sumPointsOut + r.totalPointsOut,
        }),
        { sumSendRate: 0, sumMonthsIn: 0, sumPointsOut: BigInt(0) },
      );
      // Route both sides of pointsContributionPct through
      // bigintToSafeNumber so an extreme community's cumulative
      // points total surfaces as a RangeError instead of silently
      // truncating through `Number(bigint)`. The ratio itself is a
      // [0, 1] fraction regardless of magnitude.
      const pointsContributionPct =
        totalPointsOut === BigInt(0)
          ? 0
          : bigintToSafeNumber(sumPointsOut) / bigintToSafeNumber(totalPointsOut);
      return {
        count,
        pct: totalMembers === 0 ? 0 : count / totalMembers,
        pointsContributionPct,
        avgSendRate: sumSendRate / count,
        avgMonthsIn: sumMonthsIn / count,
      };
    };

    return {
      habitual: summarize(buckets.habitual),
      regular: summarize(buckets.regular),
      occasional: summarize(buckets.occasional),
      // The latent bucket's pointsContributionPct is always 0 by
      // definition (latent === never-donated), so summarize() returns 0
      // naturally without a special case.
      latent: summarize(buckets.latent),
    };
  }

  /**
   * Filter + sort + page a pre-fetched member list. Pagination uses an
   * offset-encoded cursor (`"n"`) so the caller can resume from row N
   * without re-running the underlying aggregation. At <6 communities
   * with a few hundred members each, in-memory paging is cheaper than
   * a new SQL round-trip per page.
   */
  paginateMembers(members: SysAdminMemberStatsRow[], params: MemberListParams): MemberListResult {
    const filtered = members.filter((m) => {
      if (params.minSendRate != null && m.userSendRate < params.minSendRate) return false;
      if (params.maxSendRate != null && m.userSendRate > params.maxSendRate) return false;
      if (params.minMonthsIn != null && m.monthsIn < params.minMonthsIn) return false;
      if (params.minDonationOutMonths != null && m.donationOutMonths < params.minDonationOutMonths)
        return false;
      return true;
    });

    const sign = params.sortOrder === "ASC" ? 1 : -1;
    const numericKey = (m: SysAdminMemberStatsRow): number => {
      switch (params.sortField) {
        case "SEND_RATE":
          return m.userSendRate;
        case "MONTHS_IN":
          return m.monthsIn;
        case "DONATION_OUT_MONTHS":
          return m.donationOutMonths;
        case "TOTAL_POINTS_OUT":
          // Handled in the bigint branch below; placeholder here so
          // the switch is exhaustive.
          return 0;
      }
    };
    const sorted = [...filtered].sort((a, b) => {
      let cmp: number;
      if (params.sortField === "TOTAL_POINTS_OUT") {
        // Compare bigints directly — Number(bigint) would silently
        // lose precision past Number.MAX_SAFE_INTEGER and quietly
        // mis-order the leaderboard for extreme donors.
        if (a.totalPointsOut < b.totalPointsOut) cmp = -1;
        else if (a.totalPointsOut > b.totalPointsOut) cmp = 1;
        else cmp = 0;
      } else {
        cmp = numericKey(a) - numericKey(b);
      }
      if (cmp !== 0) return sign * cmp;
      // Stable secondary sort on userId to make the cursor deterministic.
      return a.userId.localeCompare(b.userId);
    });

    const start = params.cursor ? parseCursor(params.cursor) : 0;
    const limit = Math.min(Math.max(params.limit, 1), MAX_LIMIT);
    const page = sorted.slice(start, start + limit);
    const hasNextPage = start + limit < sorted.length;
    return {
      users: page,
      hasNextPage,
      nextCursor: hasNextPage ? encodeCursor(start + limit) : null,
    };
  }

  // ==========================================================================
  // Orchestrators — the methods the usecase actually calls
  // ==========================================================================

  // --------------------------------------------------------------------------
  // Thin pass-throughs to the repository.
  //
  // Per CLAUDE.md, the UseCase layer must not talk to repositories
  // directly — cross-layer calls go UseCase → Service → Repository.
  // These `get*` methods mirror the matching `find*` methods on the
  // repo 1:1 so the usecase can stay service-only without forcing the
  // repo to rename or split its surface.
  // --------------------------------------------------------------------------

  async getAllCommunities(ctx: IContext) {
    return this.repository.findAllCommunities(ctx);
  }

  async getCommunityById(ctx: IContext, communityId: string) {
    return this.repository.findCommunityById(ctx, communityId);
  }

  async getMemberStats(ctx: IContext, communityId: string, asOf: Date) {
    return this.repository.findMemberStats(ctx, communityId, asOf);
  }

  async getMonthlyActivity(
    ctx: IContext,
    communityId: string,
    asOf: Date,
    windowMonths: number,
  ) {
    return this.repository.findMonthlyActivity(ctx, communityId, asOf, windowMonths);
  }

  async getAllTimeTotals(ctx: IContext, communityId: string, asOf: Date) {
    return this.repository.findAllTimeTotals(ctx, communityId, asOf);
  }

  async getPlatformTotals(
    ctx: IContext,
    jstMonthStart: Date,
    jstNextMonthStart: Date,
  ) {
    return this.repository.findPlatformTotals(ctx, jstMonthStart, jstNextMonthStart);
  }

  /**
   * Week-by-week retention series across `windowMonths`.
   *
   * Fans out one `findRetentionAggregate` + one `findActivitySnapshot`
   * per target week, fired in parallel via `Promise.all`. At the
   * default `windowMonths=10` that's ~43 weeks × 2 = ~86 small SQL
   * statements.
   *
   * This was briefly rewritten as a single bulk CTE query but the
   * benchmark (`scripts/sysadmin_bench.ts`) showed the bulk form was
   * 5× slower at 100 members, 40× slower at 500, and 364× slower at
   * 2000. The `ever_before` lookup combined with the
   * `per_target` FULL OUTER JOIN scaled super-linearly in member
   * count, while the per-week loop's narrow single-week scans stay
   * cheap thanks to the `mv_user_transaction_daily`
   * `(community_id, date)` index. Postgres handles the parallel
   * queries efficiently over a single connection-pool checkout.
   */
  async getRetentionTrend(
    ctx: IContext,
    communityId: string,
    asOf: Date,
    windowMonths: number,
  ): Promise<WeeklyRetentionPoint[]> {
    const latestWeekStart = isoWeekStartJst(asOf);
    const firstMonthStart = jstMonthStartOffset(asOf, -(windowMonths - 1));
    const firstWeekStart = isoWeekStartJst(firstMonthStart);
    // Clamp each week's `nextWeekStart` at asOf+1 JST day so
    // mid-week reads don't leak memberships that joined after asOf
    // into the activity-rate denominator.
    const bounds = asOfBounds(asOf);

    const weekStarts: Date[] = [];
    for (let wk = firstWeekStart; wk <= latestWeekStart; wk = addDays(wk, 7)) {
      weekStarts.push(wk);
    }

    // Each week fires 2 queries (retention + activity snapshot).
    // At MAX windowMonths that's ~310 concurrent queries if we did a
    // naive Promise.all; FANOUT_CONCURRENCY caps it at a
    // pool-friendly 8 weeks (= 16 queries) at a time.
    const points = await runBatched(weekStarts, FANOUT_CONCURRENCY, async (weekStart) => {
      const nextWeekStart = addDays(weekStart, 7);
      const prevWeekStart = addDays(weekStart, -7);
      const twelveWeeksAgo = addDays(weekStart, -7 * 12);
      const denominatorUpperBound = bounds.clampFuture(nextWeekStart);
      const [retention, snapshot] = await Promise.all([
        this.reportService.getRetentionAggregate(ctx, communityId, {
          currentWeekStart: weekStart,
          // Clamp the upper bound of the "current week" too: for a
          // historic asOf the MV holds data past asOf, and a raw
          // `nextWeekStart` would let future sender rows into the
          // in-progress week's numerator. Past weeks' nextWeekStart
          // stays unchanged because `clampFuture` no-ops when the
          // boundary is already before asOf+1.
          nextWeekStart: denominatorUpperBound,
          prevWeekStart,
          twelveWeeksAgo,
        }),
        // Denominator for the rate: all JOINED members as of week
        // end (or asOf, whichever is earlier). Without the clamp,
        // the current-week row would include members who joined
        // between asOf and the next Monday in its denominator.
        this.repository.findActivitySnapshot(
          ctx,
          communityId,
          weekStart,
          denominatorUpperBound,
        ),
      ]);
      const communityActivityRate =
        snapshot.totalMembers === 0
          ? null
          : retention.currentSendersCount / snapshot.totalMembers;
      return {
        weekStart,
        retainedSenders: retention.retainedSenders,
        churnedSenders: retention.churnedSenders,
        returnedSenders: retention.returnedSenders,
        newMembers: retention.newMembers,
        communityActivityRate,
      };
    });

    return points;
  }

  /**
   * Monthly cohort retention for the last `windowMonths` entry months.
   * For each entry month, measures the cohort's DONATION-out activity
   * in the m+1 / m+3 / m+6 windows. Returns `null` when the lookahead
   * window ends after `asOf` (cohort too recent) or the cohort itself
   * is empty.
   */
  async getCohortRetention(
    ctx: IContext,
    communityId: string,
    asOf: Date,
    windowMonths: number,
  ): Promise<MonthlyCohortPoint[]> {
    const latestMonthStart = jstMonthStart(asOf);

    const cohortMonths: Date[] = [];
    for (let i = windowMonths - 1; i >= 0; i--) {
      cohortMonths.push(jstMonthStartOffset(latestMonthStart, -i));
    }

    // Each cohort issues up to 4 getCohortRetention calls (m1/m3/m6
    // + cohort_size probe). At MAX windowMonths=36 that's 144 queries
    // if we Promise.all'd naively; FANOUT_CONCURRENCY keeps concurrent
    // work to 8 cohorts × 4 = 32 queries, well under Prisma pool size.
    const points = await runBatched(cohortMonths, FANOUT_CONCURRENCY, async (cohortStart) => {
      const cohortEnd = jstMonthStartOffset(cohortStart, 1);
      const activeM1Start = jstMonthStartOffset(cohortStart, 1);
      const activeM1End = jstMonthStartOffset(cohortStart, 2);
      const activeM3Start = jstMonthStartOffset(cohortStart, 3);
      const activeM3End = jstMonthStartOffset(cohortStart, 4);
      const activeM6Start = jstMonthStartOffset(cohortStart, 6);
      const activeM6End = jstMonthStartOffset(cohortStart, 7);

      const fetchRetention = async (
        activeStart: Date,
        activeEnd: Date,
      ): Promise<number | null> => {
        // Skip any window whose end hasn't passed the START of the
        // asOf month. The asOf month itself is still in progress —
        // showing a cohort's retention against a partially-observed
        // month makes the number look artificially low (members
        // still have the rest of the month to donate). Only release
        // the value once `activeEnd` sits entirely in completed
        // history (i.e. at or before the current month's start).
        if (activeEnd > latestMonthStart) return null;
        const row = await this.reportService.getCohortRetention(
          ctx,
          communityId,
          { cohortStart, cohortEnd },
          { activeStart, activeEnd },
        );
        if (row.cohortSize === 0) return null;
        return row.activeNextWeek / row.cohortSize;
      };

      const [retentionM1, retentionM3, retentionM6, cohortSizeRow] = await Promise.all([
        fetchRetention(activeM1Start, activeM1End),
        fetchRetention(activeM3Start, activeM3End),
        fetchRetention(activeM6Start, activeM6End),
        // Re-use findCohortRetention with an active-window that
        // overlaps the cohort month itself just to read the
        // cohort_size counter; the numerator is ignored.
        this.reportService.getCohortRetention(
          ctx,
          communityId,
          { cohortStart, cohortEnd },
          { activeStart: cohortStart, activeEnd: cohortEnd },
        ),
      ]);

      return {
        cohortMonthStart: cohortStart,
        cohortSize: cohortSizeRow.cohortSize,
        retentionM1,
        retentionM3,
        retentionM6,
      };
    });

    return points;
  }

  /**
   * Community activity rate for the JST calendar month containing
   * `asOf`, plus the previous-month baseline needed to compute
   * `growthRateActivity` and fire the `active_drop` alert. Returned
   * shape is flat so both the L1 overview row and the L2 summary card
   * can destructure it.
   */
  async getMonthActivityWithPrev(
    ctx: IContext,
    communityId: string,
    asOf: Date,
  ): Promise<MonthActivityWithPrev> {
    const monthStart = jstMonthStart(asOf);
    const prevMonthStart = jstMonthStartOffset(monthStart, -1);
    // Cap the current-month upper bound at asOf+1 JST day so
    // mid-month / historic-asOf snapshots don't count memberships
    // created after asOf in the denominator. `findActivitySnapshot`
    // filters total_members with `created_at < upper`. The prev
    // month call doesn't need clamping because its upper bound
    // (monthStart) is strictly in the past.
    const currNextBound = asOfBounds(asOf).clampFuture(jstNextMonthStart(asOf));

    const [curr, prev] = await Promise.all([
      this.repository.findActivitySnapshot(ctx, communityId, monthStart, currNextBound),
      this.repository.findActivitySnapshot(ctx, communityId, prevMonthStart, monthStart),
    ]);

    const currRate = curr.totalMembers === 0 ? 0 : curr.senderCount / curr.totalMembers;
    const prevRate = prev.totalMembers === 0 ? 0 : prev.senderCount / prev.totalMembers;
    // Explicit `prevRate === 0` guard: `percentChange` already returns
    // null when the denominator is 0, but making both conditions
    // visible at the call site keeps the Infinity risk obvious to the
    // next reader and doesn't rely on implementation details of the
    // shared util.
    const growth =
      prev.totalMembers === 0 || prevRate === 0
        ? null
        : percentChange(currRate, prevRate);

    return {
      currentRate: currRate,
      currentSenderCount: curr.senderCount,
      currentTotalMembers: curr.totalMembers,
      // percentChange returns a percentage (×100). Convert back to a
      // fraction so downstream comparisons (`<= -20%` → `<= -0.2`) line
      // up with the requirement-doc spelling and the schema docstring.
      growthRateActivity: growth == null ? null : growth / 100,
    };
  }

  /** 3-month trailing average of communityActivityRate, ending at
   * asOf's month (inclusive). null when <3 months of trend data exist. */
  computeActivityRate3mAvg(trend: SysAdminMonthlyActivityRow[]): number | null {
    if (trend.length < 3) return null;
    const last3 = trend.slice(-3);
    const sumRates = last3.reduce((acc, r) => {
      const rate = r.totalMembersEndOfMonth === 0 ? 0 : r.senderCount / r.totalMembersEndOfMonth;
      return acc + rate;
    }, 0);
    return sumRates / 3;
  }

  /**
   * Most recent COMPLETED m1 retention: the fraction of members who
   * joined two JST months before asOf and sent a DONATION during the
   * month-after-that (= the month just before asOf's month).
   *
   * Shifted back from "prev-month cohort, asOf-month active" so the
   * active window is always a fully completed month — matches the L2
   * cohort-retention convention (README §3.4: "進行中の月は除外") and
   * avoids reporting artificially low numbers on the 1st of every
   * month. Returns null when the cohort is empty.
   */
  async getLatestCohortRetentionM1(
    ctx: IContext,
    communityId: string,
    asOf: Date,
  ): Promise<number | null> {
    const monthStart = jstMonthStart(asOf);
    const cohortStart = jstMonthStartOffset(monthStart, -2); // 2 months before asOf
    const cohortEnd = jstMonthStartOffset(monthStart, -1); // 1 month before asOf
    const activeStart = cohortEnd;
    const activeEnd = monthStart; // last completed month's end
    const row = await this.reportService.getCohortRetention(
      ctx,
      communityId,
      { cohortStart, cohortEnd },
      { activeStart, activeEnd },
    );
    if (row.cohortSize === 0) return null;
    return row.activeNextWeek / row.cohortSize;
  }

  /**
   * Evaluate all three alert flags in one pass.
   *
   * churnSpike / activeDrop use the LAST COMPLETED period (prev-week
   * vs week-before, prev-month vs month-before) rather than the
   * in-progress asOf week/month. Comparing a partially-observed week
   * against a full prior week would reliably fire the alert on
   * Monday-Tuesday of every week (the in-progress side has almost no
   * data yet). The UI's own `growthRateActivity` (current vs prev)
   * remains visible as an informational, non-alerting signal.
   *
   * noNewMembers stays anchored to asOf itself: "have any members
   * joined in the last NO_NEW_MEMBERS_WINDOW_DAYS JST days, ending
   * today." The schema description "直近14日間" uses the half-open
   * interval [asOfJstDay - (N-1), asOfJstDay + 1) so the full JST
   * calendar day containing asOf is included.
   */
  async getAlerts(ctx: IContext, communityId: string, asOf: Date): Promise<AlertFlags> {
    const latestWeekStart = isoWeekStartJst(asOf);
    // Alert frame: the completed week just before asOf's week.
    const prevWeekStart = addDays(latestWeekStart, -7);
    const prevPrevWeekStart = addDays(prevWeekStart, -7);
    const twelveWeeksAgo = addDays(prevWeekStart, -7 * 12);

    // Month frame: compare the last TWO completed months so an asOf
    // early in the month doesn't trigger activeDrop purely because
    // the in-progress month is empty.
    const monthStart = jstMonthStart(asOf);
    const prevMonthStart = jstMonthStartOffset(monthStart, -1);
    const prevPrevMonthStart = jstMonthStartOffset(monthStart, -2);

    const bounds = asOfBounds(asOf);
    const fourteenDaysAgo = addDays(
      bounds.asOfJstDayPlusOne,
      -NO_NEW_MEMBERS_WINDOW_DAYS,
    );
    const upperExclusive = bounds.asOfJstDayPlusOne;

    const [retention, newMembers, prevMonth, prevPrevMonth] = await Promise.all([
      this.reportService.getRetentionAggregate(ctx, communityId, {
        // Evaluate retention on the last completed week.
        currentWeekStart: prevWeekStart,
        nextWeekStart: latestWeekStart,
        prevWeekStart: prevPrevWeekStart,
        twelveWeeksAgo,
      }),
      this.repository.findNewMemberCount(ctx, communityId, fourteenDaysAgo, upperExclusive),
      this.repository.findActivitySnapshot(ctx, communityId, prevMonthStart, monthStart),
      this.repository.findActivitySnapshot(
        ctx,
        communityId,
        prevPrevMonthStart,
        prevMonthStart,
      ),
    ]);

    // activeDrop derives its own growth fraction from the
    // completed-month snapshot pair (prev vs prev-prev), independent
    // of the UI's growthRateActivity which tracks current-vs-prev.
    const prevRate =
      prevMonth.totalMembers === 0 ? 0 : prevMonth.senderCount / prevMonth.totalMembers;
    const prevPrevRate =
      prevPrevMonth.totalMembers === 0
        ? 0
        : prevPrevMonth.senderCount / prevPrevMonth.totalMembers;
    const alertGrowth =
      prevPrevMonth.totalMembers === 0 || prevPrevRate === 0
        ? null
        : (prevRate - prevPrevRate) / prevPrevRate;

    return {
      churnSpike: retention.churnedSenders > retention.retainedSenders,
      activeDrop: alertGrowth != null && alertGrowth <= ACTIVE_DROP_THRESHOLD,
      noNewMembers: newMembers.count === 0,
    };
  }
}

function encodeCursor(offset: number): string {
  // Simple numeric offset. Base64 to discourage clients from poking
  // into the value and to match the "opaque cursor" contract.
  return Buffer.from(String(offset), "utf8").toString("base64");
}

function parseCursor(cursor: string): number {
  try {
    const decoded = Buffer.from(cursor, "base64").toString("utf8");
    const n = Number.parseInt(decoded, 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}
