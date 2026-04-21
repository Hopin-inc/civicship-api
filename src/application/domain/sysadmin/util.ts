/**
 * JST month-level helpers for the sysadmin domain.
 *
 * These sit on top of the day-level helpers in `report/util` and share
 * the same contract: a "JST month start" is a Date whose UTC components
 * encode the first day of the JST calendar month at 00:00 (i.e. the same
 * shape Prisma hands back when reading a `@db.Date` column). That shape
 * round-trips correctly through the MV filters which compare against
 * `@db.Date` columns.
 */

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * Return the first day of the JST calendar month that `d` falls in,
 * encoded as a UTC-midnight Date (same convention as
 * `truncateToJstDate` in report/util). Using `setUTCDate(1)` on a JST
 * day value is safe because JST days are already UTC-midnight-encoded.
 */
export function jstMonthStart(d: Date): Date {
  const jst = new Date(d.getTime() + JST_OFFSET_MS);
  return new Date(Date.UTC(jst.getUTCFullYear(), jst.getUTCMonth(), 1));
}

/**
 * Return the first day of the JST month `offset` months away from the
 * month containing `d` (negative = earlier, positive = later).
 */
export function jstMonthStartOffset(d: Date, offset: number): Date {
  const start = jstMonthStart(d);
  return new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + offset, 1));
}

/** Same as jstMonthStartOffset(d, 1) — the start of the month after the
 * one containing `d`. */
export function jstNextMonthStart(d: Date): Date {
  return jstMonthStartOffset(d, 1);
}

/**
 * Format a JST-month-start Date (or any Date) as `YYYY-MM`. Uses the
 * date's UTC components because, by convention, JST month starts are
 * stored with their JST year/month encoded at UTC 00:00.
 */
export function formatJstMonth(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}
