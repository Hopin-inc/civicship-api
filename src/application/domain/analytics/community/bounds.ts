import { addDays, truncateToJstDate } from "@/application/domain/report/util";

/**
 * Clamp helper for queries whose upper bound should never land in the
 * future relative to an `asOf` timestamp.
 *
 * Four places across the analytics domain need the same calculation:
 *   - usecase.getDashboard  (findPlatformTotals upper)
 *   - service.getMonthActivityWithPrev (current-month snapshot)
 *   - service.getRetentionTrend (per-week denominator)
 *   - service.getAlerts (findNewMemberCount upper)
 *
 * Before this helper they all read roughly:
 *   const asOfJstDayPlusOne = addDays(truncateToJstDate(asOf), 1);
 *   const upper = boundary < asOfJstDayPlusOne ? boundary : asOfJstDayPlusOne;
 *
 * Centralising the expression here keeps the "asOf JST day + 1"
 * definition in one spot; if the convention ever changes (e.g. the
 * analytics boundary moves to "asOf exactly", or to start-of-next-week),
 * every call site updates together.
 */
export type AsOfBounds = {
  /**
   * The JST midnight that starts the day AFTER asOf's JST day, encoded
   * as a UTC-midnight Date (same convention as `truncateToJstDate`).
   * This is the exclusive upper bound for "anything up to and
   * including asOf's JST day".
   */
  readonly asOfJstDayPlusOne: Date;

  /**
   * Clamp a future-side boundary (e.g. `jstNextMonthStart(asOf)` or a
   * week's `nextWeekStart`) so it never exceeds `asOfJstDayPlusOne`.
   * For any boundary that's already ≤ asOfJstDayPlusOne (i.e. a past
   * month/week), the input is returned unchanged.
   */
  clampFuture(futureBoundary: Date): Date;
};

export function asOfBounds(asOf: Date): AsOfBounds {
  const asOfJstDayPlusOne = addDays(truncateToJstDate(asOf), 1);
  return {
    asOfJstDayPlusOne,
    clampFuture: (b) => (b < asOfJstDayPlusOne ? b : asOfJstDayPlusOne),
  };
}
