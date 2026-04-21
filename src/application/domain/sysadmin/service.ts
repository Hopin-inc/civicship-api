import { inject, injectable } from "tsyringe";
import { IContext } from "@/types/server";
import { ISysAdminRepository } from "@/application/domain/sysadmin/data/interface";
import { IReportRepository } from "@/application/domain/report/data/interface";
import {
  SysAdminMemberStatsRow,
  SysAdminMonthlyActivityRow,
} from "@/application/domain/sysadmin/data/type";
import { addDays, isoWeekStartJst, percentChange } from "@/application/domain/report/util";
import {
  jstMonthStart,
  jstMonthStartOffset,
  jstNextMonthStart,
} from "@/application/domain/sysadmin/util";

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

export const DEFAULT_WINDOW_MONTHS = 10;
export const MAX_LIMIT = 200;
export const ACTIVE_DROP_THRESHOLD = -0.2; // month-over-month fraction
export const NO_NEW_MEMBERS_WINDOW_DAYS = 14;

@injectable()
export default class SysAdminService {
  constructor(
    @inject("SysAdminRepository") private readonly repository: ISysAdminRepository,
    @inject("ReportRepository") private readonly reportRepository: IReportRepository,
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
      const sumSendRate = rows.reduce((acc, r) => acc + r.userSendRate, 0);
      const sumMonthsIn = rows.reduce((acc, r) => acc + r.monthsIn, 0);
      const sumPointsOut = rows.reduce<bigint>((acc, r) => acc + r.totalPointsOut, BigInt(0));
      const pointsContributionPct =
        totalPointsOut === BigInt(0) ? 0 : Number(sumPointsOut) / Number(totalPointsOut);
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
    const keyOf = (m: SysAdminMemberStatsRow): number => {
      switch (params.sortField) {
        case "SEND_RATE":
          return m.userSendRate;
        case "MONTHS_IN":
          return m.monthsIn;
        case "DONATION_OUT_MONTHS":
          return m.donationOutMonths;
        case "TOTAL_POINTS_OUT":
          return Number(m.totalPointsOut);
      }
    };
    const sorted = [...filtered].sort((a, b) => {
      const cmp = keyOf(a) - keyOf(b);
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

  /**
   * Week-by-week retention series across `windowMonths`. One bulk SQL
   * round-trip via `findWeeklyRetentionSeries` — all per-week flags
   * and the 12-week ever_before lookback are shared across weeks in a
   * single pre-aggregation. Replaces the prior per-week loop that fed
   * ~86 queries through the connection pool on every L2 page load.
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

    const weekStarts: Date[] = [];
    for (let wk = firstWeekStart; wk <= latestWeekStart; wk = addDays(wk, 7)) {
      weekStarts.push(wk);
    }

    const rows = await this.repository.findWeeklyRetentionSeries(
      ctx,
      communityId,
      weekStarts,
    );

    return rows.map((r) => ({
      weekStart: r.weekStart,
      retainedSenders: r.retainedSenders,
      churnedSenders: r.churnedSenders,
      returnedSenders: r.returnedSenders,
      newMembers: r.newMembers,
      communityActivityRate:
        r.totalMembers === 0 ? null : r.currentSendersCount / r.totalMembers,
    }));
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
    const asOfMonthEnd = jstNextMonthStart(asOf);

    const cohortMonths: Date[] = [];
    for (let i = windowMonths - 1; i >= 0; i--) {
      cohortMonths.push(jstMonthStartOffset(latestMonthStart, -i));
    }

    const points = await Promise.all(
      cohortMonths.map(async (cohortStart) => {
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
          if (activeEnd > asOfMonthEnd) return null;
          const row = await this.reportRepository.findCohortRetention(
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
          this.reportRepository.findCohortRetention(
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
      }),
    );

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
  ): Promise<{
    current: { rate: number; senderCount: number; totalMembers: number };
    previous: { rate: number; senderCount: number; totalMembers: number } | null;
    growthRateActivity: number | null;
  }> {
    const monthStart = jstMonthStart(asOf);
    const nextMonthStart = jstNextMonthStart(asOf);
    const prevMonthStart = jstMonthStartOffset(monthStart, -1);

    const [curr, prev] = await Promise.all([
      this.repository.findMonthActivity(ctx, communityId, monthStart, nextMonthStart),
      this.repository.findMonthActivity(ctx, communityId, prevMonthStart, monthStart),
    ]);

    const currRate = curr.totalMembers === 0 ? 0 : curr.senderCount / curr.totalMembers;
    const prevRate = prev.totalMembers === 0 ? 0 : prev.senderCount / prev.totalMembers;
    const growth = prev.totalMembers === 0 ? null : percentChange(currRate, prevRate);

    return {
      current: {
        rate: currRate,
        senderCount: curr.senderCount,
        totalMembers: curr.totalMembers,
      },
      previous:
        prev.totalMembers === 0
          ? null
          : {
              rate: prevRate,
              senderCount: prev.senderCount,
              totalMembers: prev.totalMembers,
            },
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
   * Retention of the members who joined during asOf's previous JST
   * month, measured in asOf's current month. null when the prior-month
   * cohort is empty (no one joined).
   */
  async getLatestCohortRetentionM1(
    ctx: IContext,
    communityId: string,
    asOf: Date,
  ): Promise<number | null> {
    const monthStart = jstMonthStart(asOf);
    const prevMonthStart = jstMonthStartOffset(monthStart, -1);
    const nextMonthStart = jstNextMonthStart(asOf);
    const row = await this.reportRepository.findCohortRetention(
      ctx,
      communityId,
      { cohortStart: prevMonthStart, cohortEnd: monthStart },
      { activeStart: monthStart, activeEnd: nextMonthStart },
    );
    if (row.cohortSize === 0) return null;
    return row.activeNextWeek / row.cohortSize;
  }

  /**
   * Evaluate all three alert flags in one pass. Uses the latest ISO
   * week for churn_spike, month-over-month fractional change for
   * active_drop, and a 14-day lookback on `t_memberships` for
   * no_new_members.
   */
  async getAlerts(
    ctx: IContext,
    communityId: string,
    asOf: Date,
    growthRateActivity: number | null,
  ): Promise<AlertFlags> {
    const latestWeekStart = isoWeekStartJst(asOf);
    const nextWeekStart = addDays(latestWeekStart, 7);
    const prevWeekStart = addDays(latestWeekStart, -7);
    const twelveWeeksAgo = addDays(latestWeekStart, -7 * 12);
    const fourteenDaysAgo = addDays(latestWeekStart, -NO_NEW_MEMBERS_WINDOW_DAYS);

    const [retention, newMembers] = await Promise.all([
      this.reportRepository.findRetentionAggregate(ctx, communityId, {
        currentWeekStart: latestWeekStart,
        nextWeekStart,
        prevWeekStart,
        twelveWeeksAgo,
      }),
      this.repository.findNewMemberCount(ctx, communityId, fourteenDaysAgo, nextWeekStart),
    ]);

    return {
      churnSpike: retention.churnedSenders > retention.retainedSenders,
      activeDrop: growthRateActivity != null && growthRateActivity <= ACTIVE_DROP_THRESHOLD,
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
