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
