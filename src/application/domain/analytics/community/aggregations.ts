import {
  bigintToSafeNumber,
  jstMonthStart,
  jstMonthStartOffset,
  truncateToJstDate,
} from "@/application/domain/report/util";
import {
  AnalyticsMemberStatsRow,
  AnalyticsMonthlyActivityRow,
} from "@/application/domain/sysadmin/data/type";
import {
  classifyMember,
  isDormant,
  MemberClassification,
  SegmentThresholds,
} from "@/application/domain/analytics/community/classifiers";

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

/**
 * Tenure-bucket distribution of a community's members at asOf,
 * classified on `daysIn` (JST calendar-day tenure). Buckets are
 * mutually exclusive and exhaustive; the four counts always sum to
 * the input `members.length`. Boundaries are intentionally
 * day-based (not month-based) to side-step the GREATEST(1, ...)
 * floor that `monthsIn` carries.
 *
 * `monthlyHistogram` carries the L3 deep-dive breakdown into 13
 * monthly buckets (0..12, where 12 aggregates 12+ months). Same
 * member set, finer granularity. The four coarse buckets remain
 * authoritative for L1 / L2 display; the histogram is additional.
 */
export type TenureHistogramBucket = {
  monthsIn: number;
  count: number;
};

export type TenureDistribution = {
  lt1Month: number;
  m1to3Months: number;
  m3to12Months: number;
  gte12Months: number;
  monthlyHistogram: TenureHistogramBucket[];
};

/** Number of monthly histogram buckets for the L3 deep-dive
 * (`monthsIn` 0..12; 12 aggregates 12+). Pinned as a constant so
 * the service computation and the test fixtures agree on the array
 * shape. */
export const TENURE_MONTHLY_BUCKETS = 13;

/** Maximum chain-depth bucket (inclusive). The L3
 * chainDepthDistribution emits depth 1..N where N aggregates
 * `chain_depth >= N`. 5 chosen as a starting point; revisit if
 * real-data inspection of `maxChainDepthAllTime` shows meaningful
 * population at the ceiling. */
export const CHAIN_DEPTH_MAX_BUCKET = 5;

/** Day-grain window for the cohort funnel's "activated within 30
 * days" stage. Pinned as a constant so the value can't drift apart
 * from the SDL contract on `AnalyticsCohortFunnelPoint.activatedD30`
 * via a bare magic number in the ms math. */
export const COHORT_ACTIVATION_WINDOW_DAYS = 30;

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

/**
 * One cohort's funnel progression. Backs
 * `AnalyticsCommunityDetailPayload.cohortFunnel`. Computed by
 * `computeCohortFunnel` over the already-fetched `members` set;
 * no separate repository call.
 */
export type AnalyticsCohortFunnelPoint = {
  cohortMonth: Date;
  acquired: number;
  activatedD30: number;
  repeated: number;
  habitual: number;
};

/**
 * Fraction of the community that sent DONATION in a window:
 * `senderCount / totalMembers`, or 0 when the community had no members
 * during the window. Appears verbatim in several orchestrators
 * (getMonthActivityWithPrev, getAlerts, computeActivityRate3mAvg); one
 * helper keeps the "divide-by-zero ⇒ 0" convention in a single place.
 */
export function rateOf(senderCount: number, totalMembers: number): number {
  return totalMembers === 0 ? 0 : senderCount / totalMembers;
}

export function computeStageCounts(
  members: AnalyticsMemberStatsRow[],
  thresholds: SegmentThresholds,
): StageCounts {
  let tier1Count = 0;
  let tier2Count = 0;
  let activeCount = 0;
  let passiveCount = 0;
  // Rules live in classifyMember so they stay in lockstep with
  // computeStageBreakdown. The translation from disjoint
  // classifications to the cumulative tier counts (habitual is also
  // tier1 AND tier2; regular is also tier2) happens here.
  for (const m of members) {
    const c = classifyMember(m, thresholds);
    if (c === "latent") {
      passiveCount++;
      continue;
    }
    activeCount++;
    if (c === "habitual") {
      tier1Count++;
      tier2Count++;
    } else if (c === "regular") {
      tier2Count++;
    }
    // "occasional" contributes only to activeCount.
  }
  return { total: members.length, tier1Count, tier2Count, activeCount, passiveCount };
}

/**
 * Four-bucket stage breakdown. Unlike `computeStageCounts` these
 * buckets are disjoint (`habitual`, `regular`, `occasional`, `latent`)
 * so `pct` sums to 1.0. `pointsContributionPct` is the share of the
 * community's total DONATION points-out attributed to each bucket.
 */
export function computeStageBreakdown(
  members: AnalyticsMemberStatsRow[],
  thresholds: SegmentThresholds,
): StageBreakdown {
  const totalMembers = members.length;
  const totalPointsOut = members.reduce<bigint>((acc, m) => acc + m.totalPointsOut, BigInt(0));

  const buckets: Record<MemberClassification, AnalyticsMemberStatsRow[]> = {
    habitual: [],
    regular: [],
    occasional: [],
    latent: [],
  };
  // Bucket key === classification, so this collapses to a single
  // dispatch per row. Disjoint semantics (a habitual member is NOT
  // also in regular) come naturally from the classifyMember
  // contract; the translation to cumulative counts lives in
  // computeStageCounts.
  for (const m of members) {
    buckets[classifyMember(m, thresholds)].push(m);
  }

  const summarize = (rows: AnalyticsMemberStatsRow[]): StageBucketStats => {
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
 * Bucket members into 4 mutually exclusive tenure ranges by their
 * `daysIn` (JST calendar-day tenure). Backs
 * `AnalyticsCommunityOverview.tenureDistribution` so the L1
 * dashboard can render community age structure (new-heavy,
 * established, etc.) without an L2 round-trip per community.
 *
 * Boundaries (left-inclusive, right-exclusive):
 *   < 30 days       → lt1Month
 *   [30, 90)        → m1to3Months
 *   [90, 365)       → m3to12Months
 *   >= 365          → gte12Months
 *
 * Day-based (not month-based) so a brand-new member never gets
 * lifted into the "1 month" bucket purely because of `monthsIn`'s
 * GREATEST(1, ...) floor.
 */
export function computeTenureDistribution(
  members: AnalyticsMemberStatsRow[],
): TenureDistribution {
  let lt1Month = 0;
  let m1to3Months = 0;
  let m3to12Months = 0;
  let gte12Months = 0;
  // monthlyHistogram pre-allocates all 13 buckets (0..12) so the
  // returned array always has a stable shape regardless of input.
  // The 12 bucket aggregates daysIn >= 365 (= 12 calendar months
  // by the same threshold the coarse `gte12Months` uses) so the
  // two stay consistent: any member counted in `gte12Months` is
  // also in histogram[12], and vice versa. Buckets 0..11 cover
  // the [0, 365) range — bucket k = floor(daysIn / 30), clamped
  // to 11 so 360..364 days do NOT silently land in the 12+
  // aggregator (otherwise they'd be in histogram[12] but coarse
  // `m3to12Months`, an asymmetry that would confuse downstream
  // consumers stacking the histogram against the coarse bars).
  const monthlyHistogram: TenureHistogramBucket[] = Array.from(
    { length: TENURE_MONTHLY_BUCKETS },
    (_, monthsIn) => ({ monthsIn, count: 0 }),
  );
  for (const m of members) {
    if (m.daysIn < 30) lt1Month++;
    else if (m.daysIn < 90) m1to3Months++;
    else if (m.daysIn < 365) m3to12Months++;
    else gte12Months++;
    // Members with daysIn < 0 (data anomaly — shouldn't occur
    // because findMemberStats clamps daysIn to >= 1) are
    // already counted in lt1Month above (daysIn < 0 < 30), so
    // they also flow into histogram bucket 0 via the
    // Math.max(0, ...) clamp below. Without that clamp,
    // floor(negative / 30) would land in a negative array
    // index and silently corrupt the histogram. Counting both
    // representations keeps the documented derivation
    // invariant (lt1Month == histogram[0]) intact.
    const bucket =
      m.daysIn >= 365
        ? TENURE_MONTHLY_BUCKETS - 1
        : Math.min(Math.max(Math.floor(m.daysIn / 30), 0), TENURE_MONTHLY_BUCKETS - 2);
    monthlyHistogram[bucket].count++;
  }
  return { lt1Month, m1to3Months, m3to12Months, gte12Months, monthlyHistogram };
}

/**
 * Count of members who donated at some point in the past but
 * whose most recent DONATION is older than `dormantThresholdDays`.
 * Excludes never-donated members (they're "latent" / passiveCount,
 * not dormant — different intervention surface).
 *
 * Pure function over the member rows already fetched for the
 * dashboard; no extra SQL.
 */
export function computeDormantCount(
  members: AnalyticsMemberStatsRow[],
  asOf: Date,
  dormantThresholdDays: number,
): number {
  let dormant = 0;
  for (const m of members) {
    if (isDormant(m, asOf, dormantThresholdDays)) dormant++;
  }
  return dormant;
}

/**
 * Per-cohort send-funnel progression for the L3 deep-dive. Pure
 * function over `members` (already-fetched in the L2 usecase) +
 * `asOf` + `windowMonths` + `thresholds` — no extra DB scan.
 *
 * Cohort = JST month start of the member's `joinedAt`. Members
 * outside the trailing windowMonths range are dropped. Stage
 * classification:
 *
 *   acquired      — every cohort member counts
 *   activatedD30  — has firstDonationDay AND
 *                   firstDonationDay - joinedAt < 30 days
 *   repeated      — donationOutMonths >= 2
 *   habitual      — classifyMember(...) === "habitual"
 *
 * activatedD30 / repeated / habitual are JOINED-at-asOf scoped
 * because `members` is itself JOINED-at-asOf (findMemberStats
 * applies the membership filter).
 */
export function computeCohortFunnel(
  members: AnalyticsMemberStatsRow[],
  asOf: Date,
  windowMonths: number,
  thresholds: SegmentThresholds,
): AnalyticsCohortFunnelPoint[] {
  // Build the cohort-month axis: [asOf month - (windowMonths-1), ..., asOf month].
  // Same orientation as `monthlyActivityTrend` (newest last) so the
  // client can render a single x-axis across both series.
  const cohortKeys: Date[] = [];
  for (let i = windowMonths - 1; i >= 0; i--) {
    cohortKeys.push(jstMonthStartOffset(asOf, -i));
  }
  const buckets = new Map<number, AnalyticsCohortFunnelPoint>();
  for (const m of cohortKeys) {
    buckets.set(m.getTime(), {
      cohortMonth: m,
      acquired: 0,
      activatedD30: 0,
      repeated: 0,
      habitual: 0,
    });
  }
  const earliest = cohortKeys[0]?.getTime() ?? 0;
  const latest = cohortKeys[cohortKeys.length - 1]?.getTime() ?? 0;
  const activationCutoffMs = COHORT_ACTIVATION_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  for (const member of members) {
    const cohort = jstMonthStart(member.joinedAt).getTime();
    if (cohort < earliest || cohort > latest) continue;
    const bucket = buckets.get(cohort);
    if (!bucket) continue;
    bucket.acquired++;
    // Both sides are JST-day grain: firstDonationDay is already
    // a JST date encoded at UTC midnight (see findMemberStats),
    // and joinedAt is truncated to its JST date here so the
    // "30 days within join" comparison is symmetric. Without
    // truncation the joinedAt time-of-day component skewed the
    // comparison by up to ±9h (JST offset), giving false
    // positives / negatives at the 30-day boundary. The day-
    // grain comparison matches the SDL "within 30 days of join"
    // wording the operator UI exposes.
    if (
      member.firstDonationDay !== null &&
      member.firstDonationDay.getTime() - truncateToJstDate(member.joinedAt).getTime() <
        activationCutoffMs
    ) {
      bucket.activatedD30++;
    }
    if (member.donationOutMonths >= 2) {
      bucket.repeated++;
    }
    if (classifyMember(member, thresholds) === "habitual") {
      bucket.habitual++;
    }
  }
  return cohortKeys.map((k) => buckets.get(k.getTime())!);
}

/** 3-month trailing average of communityActivityRate, ending at
 * asOf's month (inclusive). null when <3 months of trend data exist. */
export function computeActivityRate3mAvg(trend: AnalyticsMonthlyActivityRow[]): number | null {
  if (trend.length < 3) return null;
  const last3 = trend.slice(-3);
  const sumRates = last3.reduce(
    (acc, r) => acc + rateOf(r.senderCount, r.totalMembersEndOfMonth),
    0,
  );
  return sumRates / 3;
}
