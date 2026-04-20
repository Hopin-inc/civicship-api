import { isoWeekStartJst, percentChange } from "@/application/domain/report/util";

describe("isoWeekStartJst", () => {
  it("returns the same Monday when asked on a Monday (JST)", () => {
    // 2026-04-20 is a Monday in JST. Passing a UTC-encoded JST date with
    // any time component should still land on the same Monday.
    const mondayJst = new Date(Date.UTC(2026, 3, 20));
    expect(isoWeekStartJst(mondayJst).toISOString().slice(0, 10)).toBe("2026-04-20");
  });

  it("rolls a Sunday back to the preceding Monday", () => {
    // 2026-04-19 (Sun JST) → 2026-04-13 (Mon JST).
    const sundayJst = new Date(Date.UTC(2026, 3, 19));
    expect(isoWeekStartJst(sundayJst).toISOString().slice(0, 10)).toBe("2026-04-13");
  });

  it("rolls a mid-week date back to the same week's Monday", () => {
    // 2026-04-22 is a Wednesday in JST.
    const wedJst = new Date(Date.UTC(2026, 3, 22));
    expect(isoWeekStartJst(wedJst).toISOString().slice(0, 10)).toBe("2026-04-20");
  });

  it("handles 00:00-08:59 JST (= UTC previous day) without off-by-one", () => {
    // 2026-04-20T00:30:00+09:00 = 2026-04-19T15:30:00Z.
    // JST calendar day is Monday the 20th, so the ISO week start is the
    // 20th itself.
    const earlyMondayJst = new Date("2026-04-19T15:30:00Z");
    expect(isoWeekStartJst(earlyMondayJst).toISOString().slice(0, 10)).toBe("2026-04-20");
  });
});

describe("percentChange", () => {
  it("returns the percent delta for positive denominators", () => {
    expect(percentChange(120, 100)).toBe(20);
    expect(percentChange(50, 100)).toBe(-50);
  });

  it("returns null when the denominator is zero (no base to compare against)", () => {
    expect(percentChange(10, 0)).toBeNull();
    expect(percentChange(0, 0)).toBeNull();
  });
});
