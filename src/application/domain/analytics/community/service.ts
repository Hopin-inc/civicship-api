import { inject, injectable } from "tsyringe";
import { IContext } from "@/types/server";
import { IAnalyticsCommunityRepository } from "@/application/domain/analytics/community/data/interface";
import ReportService from "@/application/domain/report/service";
import {
  addDays,
  isoWeekStartJst,
  jstMonthStart,
  jstMonthStartOffset,
  jstNextMonthStart,
  percentChange,
} from "@/application/domain/report/util";
import { asOfBounds } from "@/application/domain/analytics/community/bounds";
import { CHAIN_DEPTH_MAX_BUCKET, rateOf } from "@/application/domain/analytics/community/aggregations";
import {
  WeeklyRetentionPoint,
  MonthlyCohortPoint,
} from "@/application/domain/analytics/community/aggregations";

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

/**
 * Raw activity counts for the parametric window driven by
 * `windowDays`. The L1 overview returns these as-is so the client
 * derives rates / growth rates / threshold alerts on its own (see
 * AnalyticsWindowActivity in schema/type.graphql).
 */
export type WindowActivityCounts = {
  senderCount: number;
  senderCountPrev: number;
  newMemberCount: number;
  newMemberCountPrev: number;
  retainedSenders: number;
};

/**
 * Raw weekly retention counts against the most recent COMPLETED ISO
 * week. Exposing both halves lets the client compose churn alerts
 * (e.g. churnedSenders > retainedSenders) without a server-side
 * threshold judgement.
 */
export type WeeklyRetentionCounts = {
  retainedSenders: number;
  churnedSenders: number;
};

/**
 * Raw counts for the most recently completed monthly cohort and its
 * M+1 activity. Cohort = (asOf JST月 - 2). Returning the count pair
 * (size, activeAtM1) instead of the pre-divided ratio lets the client
 * decide how to handle small-N cohorts (e.g. greying out values when
 * `size` is below a confidence threshold).
 */
export type LatestCohortCounts = {
  size: number;
  activeAtM1: number;
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
export const ACTIVE_DROP_THRESHOLD = -0.2; // month-over-month fraction
export const NO_NEW_MEMBERS_WINDOW_DAYS = 14;

/**
 * Bounds for the L1 overview's parametric activity window. The lower
 * bound (7) keeps the previous-window comparison meaningful; the upper
 * bound (90) caps the per-community DB scan even on a malformed input
 * value. Both are silent clamps applied at the usecase boundary.
 */
export const DEFAULT_WINDOW_DAYS = 28;
export const MIN_WINDOW_DAYS = 7;
export const MAX_WINDOW_DAYS = 90;

/**
 * Hub breadth threshold defaults & defensive bounds. The threshold
 * decides how many DISTINCT DONATION recipients within the window
 * a member needs to qualify as a hub. Default is intentionally low
 * (3) because civicship's per-member donation cadence is sparse;
 * portal can tune via AnalyticsDashboardInput.hubBreadthThreshold
 * once real-data hub distribution is observed. Effective range
 * 1..1000 — values outside are clamped at the usecase boundary the
 * same way `windowDays` is.
 */
export const DEFAULT_HUB_BREADTH_THRESHOLD = 3;
export const MIN_HUB_BREADTH_THRESHOLD = 1;
export const MAX_HUB_BREADTH_THRESHOLD = 1000;

/**
 * Days-of-silence threshold above which an ever-donated member is
 * classified as "dormant" (= sender who went quiet, distinct from
 * the never-donated "latent" cohort). Default 30 (≈ one month).
 * Effective range 1..365 enforced at the usecase boundary the same
 * way `windowDays` is.
 */
export const DEFAULT_DORMANT_THRESHOLD_DAYS = 30;
export const MIN_DORMANT_THRESHOLD_DAYS = 1;
export const MAX_DORMANT_THRESHOLD_DAYS = 365;

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
export default class AnalyticsCommunityService {
  constructor(
    @inject("AnalyticsCommunityRepository") private readonly repository: IAnalyticsCommunityRepository,
    // Cross-domain reads route through ReportService (the report
    // domain's service-layer entry point), not the report repository.
    // CLAUDE.md restricts services to "Call other domain services
    // (read operations only)" — going straight to the repository
    // would couple sysadmin to the report domain's data layer.
    @inject("ReportService") private readonly reportService: ReportService,
  ) {}

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

  async getChainDepthDistribution(ctx: IContext, communityId: string, asOf: Date) {
    return this.repository.findChainDepthDistribution(
      ctx,
      communityId,
      asOf,
      CHAIN_DEPTH_MAX_BUCKET,
    );
  }

  async getMonthlyActivity(
    ctx: IContext,
    communityId: string,
    asOf: Date,
    windowMonths: number,
    hubBreadthThreshold: number,
  ) {
    return this.repository.findMonthlyActivity(
      ctx,
      communityId,
      asOf,
      windowMonths,
      hubBreadthThreshold,
    );
  }

  async getAllTimeTotals(ctx: IContext, communityId: string, asOf: Date) {
    return this.repository.findAllTimeTotals(ctx, communityId, asOf);
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

    const currRate = rateOf(curr.senderCount, curr.totalMembers);
    const prevRate = rateOf(prev.senderCount, prev.totalMembers);
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

  /**
   * Rolling-window DONATION activity for the L1 overview. Returns the
   * raw sender / new-member counts for both the current window and the
   * immediately preceding window of equal length. The client divides
   * by `totalMembers` for rates and computes growth as
   * `(currRate - prevRate) / prevRate` with a null guard.
   *
   *   current  = [asOf - windowDays JST日, asOf + 1 JST日)
   *   previous = [asOf - 2 * windowDays, asOf - windowDays)
   *
   * All five counts come from a single repository call
   * (`findWindowActivityCounts`) which scans `mv_user_transaction_daily`
   * once over `[prevLower, upper)` and `t_memberships` once over the
   * same span — collapsing what used to be five overlapping scans
   * (curr senders + prev senders + intersection + curr new members +
   * prev new members) into two. The service's only job here is the
   * date-window arithmetic.
   */
  async getWindowActivity(
    ctx: IContext,
    communityId: string,
    asOf: Date,
    windowDays: number,
  ): Promise<WindowActivityCounts> {
    const upper = asOfBounds(asOf).asOfJstDayPlusOne;
    const currLower = addDays(upper, -windowDays);
    const prevLower = addDays(upper, -windowDays * 2);

    return this.repository.findWindowActivityCounts(
      ctx,
      communityId,
      prevLower,
      currLower,
      upper,
    );
  }

  /**
   * Count of members classified as hubs within the parametric
   * window: those who sent DONATION to at least
   * `hubBreadthThreshold` DISTINCT counterparties during
   * `[asOf - windowDays, asOf + 1 JST日)`.
   *
   * Single-axis classification (breadth only) — reaching the
   * threshold inherently requires that many transactions, so a
   * separate frequency floor would be redundant. The service's
   * only job is the date arithmetic; the count itself comes from a
   * dedicated repository SQL because it needs DISTINCT recipient
   * aggregation against `t_transactions` (which the per-day MV
   * cannot compose into a window-wide DISTINCT).
   */
  async getWindowHubMemberCount(
    ctx: IContext,
    communityId: string,
    asOf: Date,
    windowDays: number,
    hubBreadthThreshold: number,
  ): Promise<number> {
    const upper = asOfBounds(asOf).asOfJstDayPlusOne;
    const currLower = addDays(upper, -windowDays);

    const row = await this.repository.findWindowHubMemberCount(
      ctx,
      communityId,
      currLower,
      upper,
      hubBreadthThreshold,
    );
    return row.count;
  }

  /**
   * DONATION sender retention against the most recently completed ISO
   * week. The asOf-containing week is in progress, so the "latest
   * completed" week is the one starting `latestWeekStart - 7d`. The
   * existing `getRetentionAggregate` already returns these counts —
   * we just pass through the raw integers instead of reducing them to
   * a boolean alert flag, leaving the threshold judgement to the client.
   */
  async getWeeklyRetention(
    ctx: IContext,
    communityId: string,
    asOf: Date,
  ): Promise<WeeklyRetentionCounts> {
    const latestWeekStart = isoWeekStartJst(asOf);
    const prevWeekStart = addDays(latestWeekStart, -7);
    const prevPrevWeekStart = addDays(prevWeekStart, -7);
    const twelveWeeksAgo = addDays(prevWeekStart, -7 * 12);

    const retention = await this.reportService.getRetentionAggregate(ctx, communityId, {
      currentWeekStart: prevWeekStart,
      nextWeekStart: latestWeekStart,
      prevWeekStart: prevPrevWeekStart,
      twelveWeeksAgo,
    });

    return {
      retainedSenders: retention.retainedSenders,
      churnedSenders: retention.churnedSenders,
    };
  }

  /**
   * Most recently completed monthly cohort + its M+1 activity, as raw
   * counts. The cohort is selected as (asOf JST月 - 2) so the M+1
   * window — which is (asOf JST月 - 1) — is fully past; this matches
   * the L2 cohort-retention convention (README §3.4 "進行中の月は除外").
   *
   * Returning {size, activeAtM1} instead of a pre-divided Float lets
   * the client treat empty cohorts (size === 0) as null retention and
   * grey out small-N cohorts via its own confidence threshold.
   */
  async getLatestCohort(
    ctx: IContext,
    communityId: string,
    asOf: Date,
  ): Promise<LatestCohortCounts> {
    const monthStart = jstMonthStart(asOf);
    const cohortStart = jstMonthStartOffset(monthStart, -2);
    const cohortEnd = jstMonthStartOffset(monthStart, -1);
    const activeStart = cohortEnd;
    const activeEnd = monthStart;
    const row = await this.reportService.getCohortRetention(
      ctx,
      communityId,
      { cohortStart, cohortEnd },
      { activeStart, activeEnd },
    );
    return {
      size: row.cohortSize,
      activeAtM1: row.activeNextWeek,
    };
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
    // percentChange returns a percentage (× 100) and null when the
    // denominator is 0, so converting to a fraction needs one extra
    // divide — matches the same pattern getMonthActivityWithPrev uses.
    const prevRate = rateOf(prevMonth.senderCount, prevMonth.totalMembers);
    const prevPrevRate = rateOf(prevPrevMonth.senderCount, prevPrevMonth.totalMembers);
    const alertGrowthPct = percentChange(prevRate, prevPrevRate);
    const alertGrowth = alertGrowthPct == null ? null : alertGrowthPct / 100;

    return {
      churnSpike: retention.churnedSenders > retention.retainedSenders,
      activeDrop: alertGrowth != null && alertGrowth <= ACTIVE_DROP_THRESHOLD,
      noNewMembers: newMembers.count === 0,
    };
  }
}

