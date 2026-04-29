import "reflect-metadata";
import { classifyMember } from "@/application/domain/analytics/community/classifiers";
import { member } from "@/__tests__/unit/sysadmin/fixtures";

// ============================================================================
// classifyMember: shared classifier feeding both computeStageCounts and
// computeStageBreakdown. The methods only depend on this contract; the table
// of cases below is the source of truth for stage-rule behaviour.
// ============================================================================
describe("classifyMember", () => {
  const t = { tier1: 0.7, tier2: 0.4, minMonthsIn: 1 };

  it("returns latent when the member has never donated", () => {
    expect(
      classifyMember(member({ donationOutMonths: 0, userSendRate: 0, monthsIn: 12 }), t),
    ).toBe("latent");
  });

  it("returns habitual when both rate and tenure clear the bar", () => {
    expect(
      classifyMember(member({ donationOutMonths: 8, userSendRate: 0.8, monthsIn: 10 }), t),
    ).toBe("habitual");
  });

  it("returns regular when rate clears tier2 but not tier1", () => {
    expect(
      classifyMember(member({ donationOutMonths: 5, userSendRate: 0.5, monthsIn: 10 }), t),
    ).toBe("regular");
  });

  it("returns occasional when rate is below tier2", () => {
    expect(
      classifyMember(member({ donationOutMonths: 1, userSendRate: 0.1, monthsIn: 10 }), t),
    ).toBe("occasional");
  });

  it("returns occasional when daysIn is below the tenure floor even at rate=1.0", () => {
    // The short-tenure artifact case. With minMonthsIn = 3 (= 90
    // days), a member with 30 days tenure who donated once
    // (rate = 1.0) cannot be habitual or regular, but they DID
    // donate so they are not latent — they fall through to occasional.
    expect(
      classifyMember(
        member({ donationOutMonths: 1, userSendRate: 1.0, monthsIn: 1, daysIn: 30 }),
        { tier1: 0.7, tier2: 0.4, minMonthsIn: 3 },
      ),
    ).toBe("occasional");
  });

  it("uses daysIn (not monthsIn) for the tenure floor — cross-month-boundary case", () => {
    // The reason classifyMember checks daysIn rather than monthsIn:
    // a member who joined Jan 31 and is observed Feb 1 has
    // monthsIn = 2 (calendar months touched: Jan + Feb) but only
    // daysIn = 2. With minMonthsIn = 2, a monthsIn-based check
    // would silently admit them; daysIn-based check correctly
    // demotes (daysIn 2 < 2 × 30 = 60).
    expect(
      classifyMember(
        member({ donationOutMonths: 1, userSendRate: 1.0, monthsIn: 2, daysIn: 2 }),
        { tier1: 0.7, tier2: 0.4, minMonthsIn: 2 },
      ),
    ).toBe("occasional");
  });

  it("checks tier1 before tier2 so habitual takes precedence over regular", () => {
    // userSendRate 0.9 clears both tier1 (0.7) and tier2 (0.4); the
    // function should return habitual, not regular.
    expect(
      classifyMember(member({ donationOutMonths: 9, userSendRate: 0.9, monthsIn: 12 }), t),
    ).toBe("habitual");
  });

  it("checks latent before tenure floor so a never-donated member is never occasional", () => {
    // monthsIn = 0 fails the tenure floor, but donationOutMonths = 0
    // is checked first → latent, not occasional. This matches the
    // "passive is tenure-independent" promise on
    // SysAdminSegmentThresholdsInput.minMonthsIn.
    expect(
      classifyMember(member({ donationOutMonths: 0, userSendRate: 0, monthsIn: 0 }), {
        tier1: 0.7,
        tier2: 0.4,
        minMonthsIn: 3,
      }),
    ).toBe("latent");
  });
});
