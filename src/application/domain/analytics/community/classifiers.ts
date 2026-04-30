import { addDays, truncateToJstDate } from "@/application/domain/report/util";
import { AnalyticsMemberStatsRow } from "@/application/domain/analytics/community/data/type";

/**
 * Stage-count thresholds come from the client. tier1 >= tier2 >= 0 is
 * enforced at the service boundary so the cumulative-count invariant
 * (`tier2Count >= tier1Count`) is guaranteed downstream.
 */
export type SegmentThresholds = {
  tier1: number;
  tier2: number;
  /**
   * Minimum tenure required for tier1 / tier2 eligibility, expressed
   * in calendar months for the operator-facing API but evaluated
   * internally as `daysIn >= minMonthsIn × 30`. Filters out the
   * short-tenure artifact where a brand new member with one donation
   * gets `userSendRate = 1/1 = 1.0` and is auto-classified as habitual.
   * `activeCount` and `passiveCount` are unaffected (they're tenure-
   * independent by construction).
   *
   * The day-based check is intentional: monthsIn is calendar-month
   * based and inflates a 2-day cross-month-boundary tenure to
   * monthsIn = 2, which would silently pass `minMonthsIn = 2`. See
   * `classifyMember` for the full reasoning.
   */
  minMonthsIn: number;
};

// minMonthsIn = 3 aligns with the portal's DEFAULT_SEGMENT_THRESHOLDS
// (civicship-portal `_shared/derive.ts`). 1 month was the pre-issue-918
// "no tenure floor" baseline; 3 months matches the operational
// short-tenure-artifact guard the portal applies by default and the
// `tenureDistribution` MV's m3to12Months bucket boundary (90 days).
// Callers that need the looser baseline can still pass `minMonthsIn: 1`
// explicitly via AnalyticsSegmentThresholdsInput (MIN_MIN_MONTHS_IN = 1).
export const DEFAULT_SEGMENT_THRESHOLDS: SegmentThresholds = {
  tier1: 0.7,
  tier2: 0.4,
  minMonthsIn: 3,
};

export const MIN_MIN_MONTHS_IN = 1;
export const MAX_MIN_MONTHS_IN = 120;

/**
 * Approximate days-per-month conversion used to translate the
 * operator-facing `minMonthsIn` (calendar months) into the internal
 * day-count check on `daysIn`. 30 is a deliberate approximation:
 * matches the boundaries used by `tenureDistribution`'s daysIn
 * buckets (lt1Month = daysIn < 30) so the stage classifier and the
 * tenure-distribution chart agree on what "1 month" means.
 */
const DAYS_PER_MONTH_APPROX = 30;

/**
 * Single source of truth for "what stage is this member in", used by
 * both `computeStageCounts` (cumulative semantics: tier1 ⊂ tier2) and
 * `computeStageBreakdown` (disjoint buckets). Centralising the rules
 * here prevents the two methods drifting when a new axis is added —
 * the `minMonthsIn` floor was almost added to one and not the other
 * during the issue #918 work.
 *
 * The tenure floor is checked against `daysIn`, not `monthsIn`,
 * because monthsIn is calendar-month-based: a member who joined on
 * Jan 31 and is observed on Feb 1 has `monthsIn = 2` (2 calendar
 * months touched) but only `daysIn = 2` (2 actual days). Using
 * monthsIn here would let that 2-day member sail past a
 * `minMonthsIn = 2` filter, defeating the artifact guard. daysIn
 * with a 30 d/month approximation matches the `tenureDistribution`
 * bucket semantics and treats both edges symmetrically.
 *
 * Classification:
 *   latent      — never donated (donationOutMonths === 0)
 *   habitual    — userSendRate >= tier1 AND daysIn >= minMonthsIn × 30
 *   regular     — userSendRate >= tier2 AND daysIn >= minMonthsIn × 30
 *                 (and not habitual, since we check tier1 first)
 *   occasional  — donated, but either below tier2 OR below the
 *                 tenure floor (the latter is the short-tenure
 *                 artifact guard: a brand-new member who donated
 *                 once cannot be elevated above occasional)
 */
export type MemberClassification = "habitual" | "regular" | "occasional" | "latent";

export function classifyMember(
  m: AnalyticsMemberStatsRow,
  thresholds: SegmentThresholds,
): MemberClassification {
  if (m.donationOutMonths === 0) return "latent";
  // tier1 / tier2 require BOTH the rate threshold AND the tenure
  // floor. A donating-but-too-new member falls through to
  // "occasional" — they've shown some activity, but we don't have
  // enough tenure data to elevate their classification.
  if (m.daysIn < thresholds.minMonthsIn * DAYS_PER_MONTH_APPROX) return "occasional";
  if (m.userSendRate >= thresholds.tier1) return "habitual";
  if (m.userSendRate >= thresholds.tier2) return "regular";
  return "occasional";
}

/**
 * "Has this member donated before but gone quiet?" — the
 * latent-vs-dormant distinction operators care about for choosing
 * between onboarding and re-engagement interventions.
 *
 * False for never-donated members (latent / passive), regardless
 * of how long ago they joined. True only when the member's most
 * recent DONATION is strictly older than the threshold; equality
 * is treated as "still active" so a member who donated exactly
 * `dormantThresholdDays` days ago does NOT qualify.
 *
 * The cutoff is computed off the JST-truncated asOf so the
 * comparison stays deterministic regardless of the request's
 * wall-clock time. `lastDonationDay` is a JST calendar day at
 * UTC 00:00 (PostgreSQL `::date` cast); truncating asOf the same
 * way is the only way the strict-less-than has a stable boundary
 * — without it, a member who donated on the cutoff day would be
 * (incorrectly) dormant whenever `asOf` carried a nonzero
 * time-of-day component (i.e. essentially always in production).
 */
export function isDormant(
  m: AnalyticsMemberStatsRow,
  asOf: Date,
  dormantThresholdDays: number,
): boolean {
  if (m.donationOutMonths === 0 || m.lastDonationDay === null) return false;
  const cutoff = addDays(truncateToJstDate(asOf), -dormantThresholdDays);
  return m.lastDonationDay < cutoff;
}
