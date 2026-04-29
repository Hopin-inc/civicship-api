import {
  DEFAULT_SEGMENT_THRESHOLDS,
  MAX_MIN_MONTHS_IN,
  MIN_MIN_MONTHS_IN,
  SegmentThresholds,
} from "@/application/domain/analytics/community/classifiers";
import {
  DEFAULT_DORMANT_THRESHOLD_DAYS,
  DEFAULT_HUB_BREADTH_THRESHOLD,
  MAX_DORMANT_THRESHOLD_DAYS,
  MAX_HUB_BREADTH_THRESHOLD,
  MIN_DORMANT_THRESHOLD_DAYS,
  MIN_HUB_BREADTH_THRESHOLD,
} from "@/application/domain/analytics/community/service";

/**
 * Wire-format → internal form for the analytics dashboard.
 * Defensive clamps for shared GraphQL inputs (segment thresholds,
 * hub breadth, dormancy) used by both `analyticsDashboard` and
 * `analyticsCommunity` queries.
 */
export default class AnalyticsConverter {
  /**
   * Resolve and clamp the segment-thresholds input (tier1 / tier2 /
   * minMonthsIn).
   *
   * - Negative inputs are clamped to 0 so the downstream invariant
   *   `tier1 >= tier2 >= 0` holds.
   * - `minMonthsIn` is clamped to [MIN, MAX]. Default 1 preserves the
   *   pre-issue-918 behaviour (no tenure filter); portal opts in to
   *   stricter classification by passing 3+. Hard ceiling 120 prevents
   *   `minMonthsIn = 9999` classifying every member as ineligible.
   * - If a caller flips them (tier2 > tier1), they are swapped silently.
   */
  static resolveThresholds(
    input:
      | { tier1?: number | null; tier2?: number | null; minMonthsIn?: number | null }
      | null
      | undefined,
  ): SegmentThresholds {
    const tier1 = Math.max(input?.tier1 ?? DEFAULT_SEGMENT_THRESHOLDS.tier1, 0);
    const tier2 = Math.max(input?.tier2 ?? DEFAULT_SEGMENT_THRESHOLDS.tier2, 0);
    const minMonthsIn = Math.min(
      Math.max(input?.minMonthsIn ?? DEFAULT_SEGMENT_THRESHOLDS.minMonthsIn, MIN_MIN_MONTHS_IN),
      MAX_MIN_MONTHS_IN,
    );
    return tier1 >= tier2
      ? { tier1, tier2, minMonthsIn }
      : { tier1: tier2, tier2: tier1, minMonthsIn };
  }

  /**
   * Hub-classification breadth threshold. Clamped to [MIN, MAX] so
   * a malformed input can't disable hub classification (negative)
   * or scan-stall the comparison (gigantic).
   */
  static clampHubBreadthThreshold(input: number | null | undefined): number {
    const n = input ?? DEFAULT_HUB_BREADTH_THRESHOLD;
    return Math.min(Math.max(n, MIN_HUB_BREADTH_THRESHOLD), MAX_HUB_BREADTH_THRESHOLD);
  }

  /**
   * Days-of-silence threshold for the dormant-vs-active distinction.
   * Clamped to [MIN, MAX] so a malformed input can't classify every
   * member as dormant (negative) or none of them (gigantic).
   */
  static clampDormantThresholdDays(input: number | null | undefined): number {
    const n = input ?? DEFAULT_DORMANT_THRESHOLD_DAYS;
    return Math.min(Math.max(n, MIN_DORMANT_THRESHOLD_DAYS), MAX_DORMANT_THRESHOLD_DAYS);
  }
}
