import {
  formatJstMonth,
  jstMonthStart,
  jstMonthStartOffset,
  jstNextMonthStart,
} from "@/application/domain/sysadmin/util";

/**
 * JST month helpers live on top of the day-level helpers in
 * `report/util`. The key invariant they promise: the returned Date's
 * UTC components encode the first day of the JST calendar month at
 * UTC 00:00. That shape round-trips through the MV filters that
 * compare against `@db.Date` columns bucketed at JST midnight.
 */
describe("jstMonthStart", () => {
  it("returns the first day of the JST month for a mid-month JST time", () => {
    // 2026-04-21 15:00 JST == 2026-04-21 06:00 UTC
    const midMonth = new Date("2026-04-21T06:00:00Z");
    expect(jstMonthStart(midMonth).toISOString().slice(0, 10)).toBe("2026-04-01");
  });

  it("returns the current JST month when the UTC day lags by 9h", () => {
    // 2026-04-01T00:30+09:00 == 2026-03-31T15:30Z. Naive UTC truncation
    // would snap this to March; the JST-aware helper must snap it to
    // April (the same calendar month that DATE_TRUNC handling in SQL
    // sees).
    const earlyApril = new Date("2026-03-31T15:30:00Z");
    expect(jstMonthStart(earlyApril).toISOString().slice(0, 10)).toBe("2026-04-01");
  });

  it("is idempotent — applying twice yields the same value", () => {
    const d = new Date("2026-07-15T00:00:00Z");
    const once = jstMonthStart(d);
    expect(jstMonthStart(once).getTime()).toBe(once.getTime());
  });

  it("handles year boundaries (Dec → Jan) correctly", () => {
    // 2025-12-31T23:59 JST == 2025-12-31T14:59Z. This is the last
    // moment of 2025 in JST; the month start should be 2025-12-01.
    const lastMomentOf2025Jst = new Date("2025-12-31T14:59:00Z");
    expect(jstMonthStart(lastMomentOf2025Jst).toISOString().slice(0, 10)).toBe(
      "2025-12-01",
    );
  });
});

describe("jstMonthStartOffset", () => {
  it("returns the same month when offset is 0", () => {
    const d = new Date("2026-04-15T00:00:00Z");
    expect(jstMonthStartOffset(d, 0).toISOString().slice(0, 10)).toBe("2026-04-01");
  });

  it("rolls forward N months", () => {
    const d = new Date("2026-04-15T00:00:00Z");
    expect(jstMonthStartOffset(d, 3).toISOString().slice(0, 10)).toBe("2026-07-01");
  });

  it("rolls back N months", () => {
    const d = new Date("2026-04-15T00:00:00Z");
    expect(jstMonthStartOffset(d, -3).toISOString().slice(0, 10)).toBe("2026-01-01");
  });

  it("crosses a year boundary going backward", () => {
    const d = new Date("2026-02-10T00:00:00Z");
    expect(jstMonthStartOffset(d, -3).toISOString().slice(0, 10)).toBe("2025-11-01");
  });

  it("crosses a year boundary going forward", () => {
    const d = new Date("2025-11-20T00:00:00Z");
    expect(jstMonthStartOffset(d, 3).toISOString().slice(0, 10)).toBe("2026-02-01");
  });

  it("handles a 10-month windowMonths lookback (used by L2 default)", () => {
    // Default windowMonths = 10: the earliest month in the trend is
    // 9 months before asOf's month.
    const asOf = new Date("2026-04-21T00:00:00Z");
    expect(jstMonthStartOffset(asOf, -9).toISOString().slice(0, 10)).toBe(
      "2025-07-01",
    );
  });
});

describe("jstNextMonthStart", () => {
  it("returns the first day of the following month", () => {
    const d = new Date("2026-04-21T06:00:00Z");
    expect(jstNextMonthStart(d).toISOString().slice(0, 10)).toBe("2026-05-01");
  });

  it("wraps Dec → Jan of the next year", () => {
    const d = new Date("2025-12-15T00:00:00Z");
    expect(jstNextMonthStart(d).toISOString().slice(0, 10)).toBe("2026-01-01");
  });

  it("returns the next month even when called on the 1st", () => {
    // Confirms the helper doesn't accidentally return the same month
    // when already at a month boundary.
    const firstOfMonth = new Date("2026-04-01T00:00:00Z");
    expect(jstNextMonthStart(firstOfMonth).toISOString().slice(0, 10)).toBe(
      "2026-05-01",
    );
  });
});

describe("formatJstMonth", () => {
  it("formats the JST-encoded date as YYYY-MM", () => {
    const d = new Date("2026-04-01T00:00:00Z");
    expect(formatJstMonth(d)).toBe("2026-04");
  });

  it("zero-pads single-digit months", () => {
    const d = new Date("2026-01-01T00:00:00Z");
    expect(formatJstMonth(d)).toBe("2026-01");
  });

  it("reads from UTC components (JST month convention)", () => {
    // Input is a UTC-encoded JST month start. UTC month + 1 == label.
    const d = new Date(Date.UTC(2025, 10, 1)); // UTC Nov 1, 2025
    expect(formatJstMonth(d)).toBe("2025-11");
  });
});
