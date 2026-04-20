/**
 * JST timezone utilities for the report dataset.
 *
 * The materialized views bucket dates with `AT TIME ZONE 'Asia/Tokyo'` into
 * `@db.Date` columns. Prisma serializes Date values without timezone info for
 * `@db.Date`, so passing a UTC-midnight Date whose year/month/day match the
 * intended JST calendar date is what lines up the filter with the MV. These
 * helpers centralise that contract.
 */

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * Truncate a Date to the start of its Asia/Tokyo calendar day, returning a
 * Date whose UTC components encode that JST date at UTC 00:00.
 *
 * Using naive `setUTCHours(0,0,0,0)` would cause an off-by-one during
 * 00:00–08:59 JST (= 15:00–23:59 UTC previous day).
 */
export function truncateToJstDate(d: Date): Date {
  const jst = new Date(d.getTime() + JST_OFFSET_MS);
  return new Date(Date.UTC(jst.getUTCFullYear(), jst.getUTCMonth(), jst.getUTCDate()));
}

export function addDays(d: Date, days: number): Date {
  const t = new Date(d);
  t.setUTCDate(t.getUTCDate() + days);
  return t;
}

/**
 * Number of full JST days between two timestamps (b - a). Both inputs are
 * truncated to their JST calendar day first so the result is independent of
 * the time-of-day component.
 */
export function daysBetweenJst(a: Date, b: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const aDay = truncateToJstDate(a);
  const bDay = truncateToJstDate(b);
  return Math.floor((bDay.getTime() - aDay.getTime()) / msPerDay);
}

/**
 * Convert any Date into the ISO `YYYY-MM-DD` string of its Asia/Tokyo
 * calendar day. Safe to call on either:
 *   - a Date sourced from a JST-bucketed `@db.Date` column (already at UTC
 *     00:00 with the JST year/month/day), or
 *   - a Date holding a full TIMESTAMPTZ value (e.g. `joinedAt` from
 *     `m.created_at`).
 *
 * Internally truncates to the JST day before formatting, so the previous
 * `d.toISOString().slice(0,10)` shortcut — which silently emitted the UTC
 * calendar date for full timestamps falling in the 15:00–23:59 UTC window —
 * is no longer a footgun.
 */
export function toJstIsoDate(d: Date): string {
  return truncateToJstDate(d).toISOString().slice(0, 10);
}

/**
 * Convert a BigInt to a Number, throwing if the value would lose precision
 * (i.e. lies outside Number.MAX_SAFE_INTEGER). Used for AI-payload fields
 * where downstream consumers expect plain JSON numbers; failing fast surfaces
 * the issue rather than silently corrupting rankings/aggregates.
 */
export function bigintToSafeNumber(value: bigint): number {
  const MAX = BigInt(Number.MAX_SAFE_INTEGER);
  const MIN = BigInt(Number.MIN_SAFE_INTEGER);
  if (value > MAX || value < MIN) {
    throw new RangeError(`Report value ${value.toString()} exceeds JavaScript safe integer range`);
  }
  return Number(value);
}

/**
 * Return the Monday-00:00-JST "ISO week start" day for the JST calendar day
 * that `d` falls in. Mirrors the DATE_TRUNC('week', ...) semantics used by
 * `v_user_cohort` and the retention SQL, so retention windows computed in
 * application code line up 1:1 with the SQL-side week bucketing.
 *
 * Output follows the same UTC-encoded-JST-date convention as
 * `truncateToJstDate`: a Date whose UTC components encode the JST Monday's
 * year/month/day at UTC 00:00.
 */
export function isoWeekStartJst(d: Date): Date {
  const jstDay = truncateToJstDate(d);
  // `getUTCDay()` on a UTC-encoded JST date returns the JST day-of-week
  // (0=Sunday … 6=Saturday). (day + 6) % 7 produces the number of days to
  // subtract to reach the ISO Monday (Mon=0, Tue=1, … Sun=6).
  const daysBackToMonday = (jstDay.getUTCDay() + 6) % 7;
  return addDays(jstDay, -daysBackToMonday);
}

/**
 * Week-over-week percent change of `current` relative to `previous`.
 *
 * Returns `null` when `previous` is zero so a divide-by-zero never surfaces
 * as `Infinity` / `NaN` in the LLM payload. Callers should treat `null` as
 * "no prior period signal to compare against" — a legitimately-new community
 * with no activity last week should not imply "infinite growth".
 */
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}
