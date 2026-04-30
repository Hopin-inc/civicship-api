import "reflect-metadata";
import {
  computeActivityRate3mAvg,
  computeCohortFunnel,
  computeDormantCount,
  computeStageBreakdown,
  computeStageCounts,
  computeTenureDistribution,
} from "@/application/domain/analytics/community/aggregations";
import { DEFAULT_SEGMENT_THRESHOLDS } from "@/application/domain/analytics/community/classifiers";
import type { AnalyticsMonthlyActivityRow } from "@/application/domain/analytics/community/data/type";
import { member } from "@/__tests__/unit/analytics/community/fixtures";

// ========================================================================
// computeStageCounts: cumulative (tier2 includes tier1)
// ========================================================================
describe("computeStageCounts", () => {
  it("classifies members by the supplied thresholds with cumulative tiers", () => {
    // userSendRate: 0 (latent), 0.3 (occasional), 0.5 (regular),
    // 0.8 (habitual). Default thresholds tier1=0.7, tier2=0.4.
    // monthsIn = 6 keeps every member above the default minMonthsIn = 3
    // tenure floor so the test exercises the rate axis only.
    const members = [
      member({ userId: "a", monthsIn: 6, donationOutMonths: 0, userSendRate: 0 }),
      member({ userId: "b", monthsIn: 6, donationOutMonths: 1, userSendRate: 0.3 }),
      member({ userId: "c", monthsIn: 6, donationOutMonths: 2, userSendRate: 0.5 }),
      member({ userId: "d", monthsIn: 6, donationOutMonths: 5, userSendRate: 0.8 }),
    ];
    const counts = computeStageCounts(members, DEFAULT_SEGMENT_THRESHOLDS);
    expect(counts).toEqual({
      total: 4,
      tier1Count: 1, // userSendRate >= 0.7 (habitual)
      tier2Count: 2, // userSendRate >= 0.4 (regular + habitual — cumulative)
      activeCount: 3, // donationOutMonths > 0
      passiveCount: 1, // donationOutMonths == 0
    });
  });

  it("treats members with donationOutMonths=0 as passive even if userSendRate is nonzero", () => {
    // userSendRate is a derived value; the authoritative signal for
    // "has this user ever donated?" is donationOutMonths > 0.
    const members = [member({ userId: "a", donationOutMonths: 0, userSendRate: 0.9 })];
    const counts = computeStageCounts(members, DEFAULT_SEGMENT_THRESHOLDS);
    expect(counts.passiveCount).toBe(1);
    expect(counts.tier1Count).toBe(0);
    expect(counts.activeCount).toBe(0);
  });

  it("exactly-at-threshold rows are INCLUDED (>= comparison)", () => {
    // userSendRate == tier1 exactly should count as habitual.
    // monthsIn = 6 clears the default minMonthsIn = 3 floor.
    const members = [
      member({ userId: "a", monthsIn: 6, donationOutMonths: 7, userSendRate: 0.7 }),
      member({ userId: "b", monthsIn: 6, donationOutMonths: 4, userSendRate: 0.4 }),
    ];
    const counts = computeStageCounts(members, DEFAULT_SEGMENT_THRESHOLDS);
    expect(counts.tier1Count).toBe(1);
    expect(counts.tier2Count).toBe(2);
  });

  it("empty member list yields all-zero counts", () => {
    expect(computeStageCounts([], DEFAULT_SEGMENT_THRESHOLDS)).toEqual({
      total: 0,
      tier1Count: 0,
      tier2Count: 0,
      activeCount: 0,
      passiveCount: 0,
    });
  });

  it("custom thresholds re-classify existing members without a new scan", () => {
    const members = [
      member({ userId: "a", donationOutMonths: 3, userSendRate: 0.5 }),
      member({ userId: "b", donationOutMonths: 5, userSendRate: 0.9 }),
    ];
    // Loosen tier1 to 0.5: now BOTH users are habitual.
    // minMonthsIn defaults to 1 (no tenure floor) so both qualify.
    const counts = computeStageCounts(members, {
      tier1: 0.5,
      tier2: 0.3,
      minMonthsIn: 1,
    });
    expect(counts.tier1Count).toBe(2);
    expect(counts.tier2Count).toBe(2);
  });

  // ====================================================================
  // minMonthsIn: short-tenure artifact guard (issue #918, refinement 1)
  // ====================================================================
  it("minMonthsIn = 1 (legacy override) admits a 1-month-tenure habitual sender", () => {
    // Reproduces the artifact the default guards against: a brand-new
    // member who donated once their first month — userSendRate = 1/1 =
    // 1.0, comfortably over tier1 = 0.7. With the legacy minMonthsIn =
    // 1 (now an explicit opt-in via AnalyticsSegmentThresholdsInput),
    // they count as habitual.
    const members = [
      member({ userId: "n", monthsIn: 1, donationOutMonths: 1, userSendRate: 1.0 }),
    ];
    const counts = computeStageCounts(members, {
      tier1: 0.7,
      tier2: 0.4,
      minMonthsIn: 1,
    });
    expect(counts.tier1Count).toBe(1);
    expect(counts.tier2Count).toBe(1);
    expect(counts.activeCount).toBe(1);
    expect(counts.passiveCount).toBe(0);
  });

  it("minMonthsIn = 3 demotes the same 1-month-tenure habitual sender out of tier1 / tier2", () => {
    // Same input, stricter tenure floor. The member is no longer
    // eligible for tier1 / tier2 — they fall through to active
    // (they did donate) but neither tier counts them.
    const members = [
      member({ userId: "n", monthsIn: 1, donationOutMonths: 1, userSendRate: 1.0 }),
    ];
    const counts = computeStageCounts(members, {
      tier1: 0.7,
      tier2: 0.4,
      minMonthsIn: 3,
    });
    expect(counts.tier1Count).toBe(0);
    expect(counts.tier2Count).toBe(0);
    // activeCount / passiveCount are tenure-independent: the member
    // donated, so they count as active either way.
    expect(counts.activeCount).toBe(1);
    expect(counts.passiveCount).toBe(0);
  });

  it("minMonthsIn does not demote established members above the rate threshold", () => {
    // 6 months tenure, 5 of them with a donation: rate ~ 0.83,
    // habitual. minMonthsIn = 3 has no effect — they cleared the
    // tenure floor years ago.
    const members = [
      member({ userId: "old", monthsIn: 6, donationOutMonths: 5, userSendRate: 0.83 }),
    ];
    const counts = computeStageCounts(members, {
      tier1: 0.7,
      tier2: 0.4,
      minMonthsIn: 3,
    });
    expect(counts.tier1Count).toBe(1);
    expect(counts.tier2Count).toBe(1);
  });

  it("minMonthsIn does not affect passiveCount", () => {
    // Even with a strict tenure floor, "never donated" is still
    // "passive" — the tenure filter applies only to tier1 / tier2
    // promotion, not to the passive bucket.
    const members = [
      member({ userId: "p1", monthsIn: 1, donationOutMonths: 0, userSendRate: 0 }),
      member({ userId: "p2", monthsIn: 12, donationOutMonths: 0, userSendRate: 0 }),
    ];
    const counts = computeStageCounts(members, {
      tier1: 0.7,
      tier2: 0.4,
      minMonthsIn: 3,
    });
    expect(counts.passiveCount).toBe(2);
    expect(counts.activeCount).toBe(0);
  });
});

// ========================================================================
// computeTenureDistribution: 4-bucket daysIn classification (issue #918, refinement 2)
// ========================================================================
describe("computeTenureDistribution", () => {
  function emptyHistogram() {
    return Array.from({ length: 13 }, (_, monthsIn) => ({ monthsIn, count: 0 }));
  }

  it("buckets members by daysIn boundaries", () => {
    const members = [
      member({ userId: "a", daysIn: 1 }), // lt1Month / hist[0]
      member({ userId: "b", daysIn: 29 }), // lt1Month / hist[0]
      member({ userId: "c", daysIn: 30 }), // m1to3Months / hist[1]
      member({ userId: "d", daysIn: 89 }), // m1to3Months / hist[2]
      member({ userId: "e", daysIn: 90 }), // m3to12Months / hist[3]
      member({ userId: "f", daysIn: 364 }), // m3to12Months / hist[11] (clamped, 365 boundary)
      member({ userId: "g", daysIn: 365 }), // gte12Months / hist[12]
      member({ userId: "h", daysIn: 1500 }), // gte12Months / hist[12]
    ];
    const dist = computeTenureDistribution(members);
    expect(dist.lt1Month).toBe(2);
    expect(dist.m1to3Months).toBe(2);
    expect(dist.m3to12Months).toBe(2);
    expect(dist.gte12Months).toBe(2);
    // monthlyHistogram check. Boundary is aligned with the coarse
    // gte12Months bucket: bucket 12 ≡ daysIn >= 365, NOT
    // floor(daysIn/30) >= 12. Members at 360..364 days fall into
    // bucket 11 (clamped) and coarse m3to12Months — both
    // representations agree. So `gte12Months == histogram[12]`
    // and the histogram buckets 0..11 sum to lt1Month +
    // m1to3Months + m3to12Months.
    const expectedCounts = new Map<number, number>([
      [0, 2], // 1d, 29d
      [1, 1], // 30d
      [2, 1], // 89d
      [3, 1], // 90d
      [11, 1], // 364d (clamped to 11, NOT 12, since daysIn < 365)
      [12, 2], // 365d, 1500d (daysIn >= 365)
    ]);
    for (const bucket of dist.monthlyHistogram) {
      expect(bucket.count).toBe(expectedCounts.get(bucket.monthsIn) ?? 0);
    }
    expect(dist.monthlyHistogram).toHaveLength(13);
    // Invariant: histogram[12] == gte12Months (boundaries
    // aligned). Test pins this so a future tweak that drifts
    // them apart breaks loudly.
    expect(dist.monthlyHistogram[12].count).toBe(dist.gte12Months);
  });

  it("returns all-zero buckets for empty input", () => {
    expect(computeTenureDistribution([])).toEqual({
      lt1Month: 0,
      m1to3Months: 0,
      m3to12Months: 0,
      gte12Months: 0,
      monthlyHistogram: emptyHistogram(),
    });
  });

  it("buckets sum to total member count (no double-counting / no drops)", () => {
    const members = [
      member({ userId: "a", daysIn: 5 }),
      member({ userId: "b", daysIn: 50 }),
      member({ userId: "c", daysIn: 200 }),
      member({ userId: "d", daysIn: 800 }),
      member({ userId: "e", daysIn: 800 }),
    ];
    const dist = computeTenureDistribution(members);
    expect(dist.lt1Month + dist.m1to3Months + dist.m3to12Months + dist.gte12Months).toBe(
      members.length,
    );
  });
});

// ========================================================================
// computeCohortFunnel: per-cohort acquisition / activation / repeat /
// habitual progression for the L3 deep-dive
// ========================================================================
describe("computeCohortFunnel", () => {
  const asOf = new Date("2026-04-15T00:00:00Z");
  const thresholds = { tier1: 0.7, tier2: 0.4, minMonthsIn: 1 };

  it("buckets members by their JST cohort month and counts each stage", () => {
    const members = [
      // Cohort 2026-02: one acquired, activated D30, repeated, habitual.
      member({
        userId: "a",
        joinedAt: new Date("2026-02-05T00:00:00Z"),
        firstDonationDay: new Date("2026-02-10T00:00:00Z"),
        lastDonationDay: new Date("2026-04-10T00:00:00Z"),
        donationOutMonths: 3,
        monthsIn: 3,
        daysIn: 70,
        userSendRate: 1.0, // habitual
      }),
      // Cohort 2026-03: acquired only — no donation yet.
      member({
        userId: "b",
        joinedAt: new Date("2026-03-20T00:00:00Z"),
        firstDonationDay: null,
        lastDonationDay: null,
        donationOutMonths: 0,
        monthsIn: 1,
        daysIn: 26,
        userSendRate: 0,
      }),
      // Cohort 2026-03: activated (D30) but only 1 donation month, not repeated, not habitual.
      member({
        userId: "c",
        joinedAt: new Date("2026-03-01T00:00:00Z"),
        firstDonationDay: new Date("2026-03-15T00:00:00Z"),
        lastDonationDay: new Date("2026-03-15T00:00:00Z"),
        donationOutMonths: 1,
        monthsIn: 2,
        daysIn: 45,
        userSendRate: 0.5, // regular
      }),
      // Outside the window — should be excluded.
      member({
        userId: "d",
        joinedAt: new Date("2025-01-01T00:00:00Z"),
        firstDonationDay: null,
        lastDonationDay: null,
        donationOutMonths: 0,
      }),
    ];
    const funnel = computeCohortFunnel(members, asOf, 3, thresholds);
    expect(funnel).toHaveLength(3);
    // Newest-last orientation: [Feb, Mar, Apr]. Cohort month is
    // encoded as UTC midnight on the first of the JST month
    // (matches `jstMonthStart` convention used by sibling trend
    // arrays — the SDL "2025-10-01T00:00+09:00" wording is the
    // displayed JST equivalent of this UTC instant).
    expect(funnel[0].cohortMonth.toISOString()).toBe("2026-02-01T00:00:00.000Z");
    expect(funnel[0]).toMatchObject({
      acquired: 1,
      activatedD30: 1,
      repeated: 1,
      habitual: 1,
    });
    expect(funnel[1].cohortMonth.toISOString()).toBe("2026-03-01T00:00:00.000Z");
    expect(funnel[1]).toMatchObject({
      acquired: 2,
      activatedD30: 1,
      repeated: 0,
      habitual: 0,
    });
    // Apr cohort empty in this fixture.
    expect(funnel[2].cohortMonth.toISOString()).toBe("2026-04-01T00:00:00.000Z");
    expect(funnel[2]).toMatchObject({
      acquired: 0,
      activatedD30: 0,
      repeated: 0,
      habitual: 0,
    });
  });

  it("does not count activatedD30 when first donation is on day 30 or later", () => {
    // Cutoff is strict-less-than 30 × 86400000 ms. Day 30 ≡ exactly
    // at the boundary → not counted (matches the SDL "within 30
    // days" wording: 30 itself is excluded).
    const members = [
      member({
        userId: "a",
        joinedAt: new Date("2026-02-01T00:00:00Z"),
        firstDonationDay: new Date(
          new Date("2026-02-01T00:00:00Z").getTime() + 30 * 24 * 60 * 60 * 1000,
        ),
        donationOutMonths: 1,
      }),
    ];
    const funnel = computeCohortFunnel(members, asOf, 3, thresholds);
    const feb = funnel.find((f) => f.cohortMonth.getUTCMonth() === 1)!;
    expect(feb.acquired).toBe(1);
    expect(feb.activatedD30).toBe(0);
  });
});

// ========================================================================
// isDormant + computeDormantCount: latent vs dormant distinction
// (issue #918 follow-up: separate "never donated" from "went quiet")
// ========================================================================
describe("computeDormantCount", () => {
  const asOf = new Date("2026-04-26T00:00:00Z");
  const dayBefore = (n: number) => new Date(asOf.getTime() - n * 24 * 60 * 60 * 1000);

  it("counts only members whose last donation is older than the threshold", () => {
    const members = [
      // never donated → latent, NOT dormant
      member({ userId: "latent", donationOutMonths: 0, lastDonationDay: null }),
      // donated 5 days ago → still active
      member({
        userId: "active",
        donationOutMonths: 3,
        lastDonationDay: dayBefore(5),
      }),
      // donated 31 days ago → dormant under default 30
      member({
        userId: "dormant",
        donationOutMonths: 3,
        lastDonationDay: dayBefore(31),
      }),
      // donated 90 days ago → dormant
      member({
        userId: "very-dormant",
        donationOutMonths: 3,
        lastDonationDay: dayBefore(90),
      }),
    ];
    expect(computeDormantCount(members, asOf, 30)).toBe(2);
  });

  it("treats last-donation-exactly-N-days-ago as STILL ACTIVE (strict <)", () => {
    // The cutoff is asOf - N days. lastDonationDay must be
    // strictly older than the cutoff to qualify. A member who
    // donated exactly N days ago sits at the cutoff and is not
    // dormant — gives operators a deterministic boundary.
    const members = [
      member({
        userId: "edge",
        donationOutMonths: 1,
        lastDonationDay: dayBefore(30),
      }),
    ];
    expect(computeDormantCount(members, asOf, 30)).toBe(0);
  });

  it("never counts latent members regardless of threshold", () => {
    // donationOutMonths === 0 short-circuits to false even when
    // lastDonationDay is somehow set (defensive).
    const members = [
      member({ userId: "n1", donationOutMonths: 0, lastDonationDay: null }),
      member({ userId: "n2", donationOutMonths: 0, lastDonationDay: null }),
    ];
    expect(computeDormantCount(members, asOf, 1)).toBe(0);
    expect(computeDormantCount(members, asOf, 365)).toBe(0);
  });

  it("scales with the threshold — larger thresholds shrink the dormant set", () => {
    const members = [
      member({ userId: "a", donationOutMonths: 1, lastDonationDay: dayBefore(45) }),
      member({ userId: "b", donationOutMonths: 1, lastDonationDay: dayBefore(120) }),
    ];
    expect(computeDormantCount(members, asOf, 30)).toBe(2);
    expect(computeDormantCount(members, asOf, 60)).toBe(1);
    expect(computeDormantCount(members, asOf, 365)).toBe(0);
  });

  it("treats edge case as active even when asOf has a nonzero time-of-day (regression)", () => {
    // Production asOf is `new Date()` with the wall-clock time
    // component preserved (e.g. 06:17:55Z). lastDonationDay is a
    // JST calendar day at UTC 00:00 (the SQL ::date cast in
    // findMemberStatsBulk strips the time). Without truncating asOf
    // to its JST date before subtracting days, a member who
    // donated on the cutoff day has lastDonationDay = cutoff-day
    // 00:00Z < cutoff-day HH:MM:SSZ → they'd be misclassified as
    // dormant whenever asOf carried any nonzero time component.
    // This test pins down the truncate-then-subtract contract.
    const asOfWithTime = new Date("2026-04-26T06:17:55Z");
    const members = [
      member({
        userId: "edge",
        donationOutMonths: 1,
        // 30 days before 2026-04-26 in JST is 2026-03-27 → at UTC 00:00
        lastDonationDay: new Date("2026-03-27T00:00:00Z"),
      }),
    ];
    expect(computeDormantCount(members, asOfWithTime, 30)).toBe(0);
  });

  it("respects the dormantCount <= totalMembers - latent invariant", () => {
    // 3 latent + 2 active + 1 dormant. dormantCount = 1, latent = 3,
    // total = 6, so dormantCount (1) <= total (6) - latent (3) = 3.
    const members = [
      member({ userId: "l1", donationOutMonths: 0, lastDonationDay: null }),
      member({ userId: "l2", donationOutMonths: 0, lastDonationDay: null }),
      member({ userId: "l3", donationOutMonths: 0, lastDonationDay: null }),
      member({ userId: "a1", donationOutMonths: 2, lastDonationDay: dayBefore(5) }),
      member({ userId: "a2", donationOutMonths: 2, lastDonationDay: dayBefore(10) }),
      member({ userId: "d1", donationOutMonths: 2, lastDonationDay: dayBefore(60) }),
    ];
    const dormant = computeDormantCount(members, asOf, 30);
    const latent = members.filter((m) => m.donationOutMonths === 0).length;
    expect(dormant).toBe(1);
    expect(dormant).toBeLessThanOrEqual(members.length - latent);
  });
});

// ========================================================================
// computeStageBreakdown: disjoint buckets sum to 100%
// ========================================================================
describe("computeStageBreakdown", () => {
  it("splits members into 4 disjoint buckets whose counts sum to total", () => {
    // monthsIn = 6 keeps every member above the default minMonthsIn = 3
    // tenure floor so the test exercises the rate axis only.
    const members = [
      member({ userId: "a", monthsIn: 6, donationOutMonths: 0, userSendRate: 0 }), // latent
      member({ userId: "b", monthsIn: 6, donationOutMonths: 1, userSendRate: 0.3 }), // occasional
      member({ userId: "c", monthsIn: 6, donationOutMonths: 2, userSendRate: 0.5 }), // regular
      member({ userId: "d", monthsIn: 6, donationOutMonths: 7, userSendRate: 0.9 }), // habitual
    ];
    const bd = computeStageBreakdown(members, DEFAULT_SEGMENT_THRESHOLDS);
    expect(bd.latent.count).toBe(1);
    expect(bd.occasional.count).toBe(1);
    expect(bd.regular.count).toBe(1);
    expect(bd.habitual.count).toBe(1);
    expect(bd.latent.count + bd.occasional.count + bd.regular.count + bd.habitual.count).toBe(
      members.length,
    );
  });

  it("pct of each bucket sums to 1.0", () => {
    const members = [
      member({ userId: "a", monthsIn: 6, donationOutMonths: 0 }),
      member({ userId: "b", monthsIn: 6, donationOutMonths: 0 }),
      member({ userId: "c", monthsIn: 6, donationOutMonths: 3, userSendRate: 0.4 }),
      member({ userId: "d", monthsIn: 6, donationOutMonths: 7, userSendRate: 0.8 }),
    ];
    const bd = computeStageBreakdown(members, DEFAULT_SEGMENT_THRESHOLDS);
    expect(bd.latent.pct + bd.occasional.pct + bd.regular.pct + bd.habitual.pct).toBeCloseTo(
      1.0,
    );
  });

  it("pointsContributionPct is 0 for latent and sums to 1.0 over non-latent buckets", () => {
    // Habitual: 700pt, regular: 200pt, occasional: 100pt. Total 1000.
    // monthsIn = 6 keeps every member above the default minMonthsIn = 3
    // tenure floor so the test exercises the rate axis only.
    const members = [
      member({ userId: "a", monthsIn: 6, donationOutMonths: 0, totalPointsOut: BigInt(0) }),
      member({
        userId: "b",
        monthsIn: 6,
        donationOutMonths: 1,
        userSendRate: 0.3,
        totalPointsOut: BigInt(100),
      }),
      member({
        userId: "c",
        monthsIn: 6,
        donationOutMonths: 4,
        userSendRate: 0.5,
        totalPointsOut: BigInt(200),
      }),
      member({
        userId: "d",
        monthsIn: 6,
        donationOutMonths: 7,
        userSendRate: 0.9,
        totalPointsOut: BigInt(700),
      }),
    ];
    const bd = computeStageBreakdown(members, DEFAULT_SEGMENT_THRESHOLDS);
    expect(bd.latent.pointsContributionPct).toBe(0);
    expect(bd.occasional.pointsContributionPct).toBeCloseTo(0.1);
    expect(bd.regular.pointsContributionPct).toBeCloseTo(0.2);
    expect(bd.habitual.pointsContributionPct).toBeCloseTo(0.7);
  });

  it("empty buckets return all-zero stats (no divide-by-zero)", () => {
    const members = [
      member({ userId: "a", donationOutMonths: 0 }),
      member({ userId: "b", donationOutMonths: 0 }),
    ];
    const bd = computeStageBreakdown(members, DEFAULT_SEGMENT_THRESHOLDS);
    expect(bd.habitual).toEqual({
      count: 0,
      pct: 0,
      pointsContributionPct: 0,
      avgSendRate: 0,
      avgMonthsIn: 0,
    });
    expect(bd.regular.count).toBe(0);
    expect(bd.occasional.count).toBe(0);
    expect(bd.latent.count).toBe(2);
  });

  it("empty member list returns four all-zero buckets", () => {
    const bd = computeStageBreakdown([], DEFAULT_SEGMENT_THRESHOLDS);
    for (const bucket of [bd.habitual, bd.regular, bd.occasional, bd.latent]) {
      expect(bucket).toEqual({
        count: 0,
        pct: 0,
        pointsContributionPct: 0,
        avgSendRate: 0,
        avgMonthsIn: 0,
      });
    }
  });
});

// ========================================================================
// computeActivityRate3mAvg: null when <3 months of data
// ========================================================================
describe("computeActivityRate3mAvg", () => {
  function trendRow(
    month: string,
    senderCount: number,
    totalMembers: number,
  ): AnalyticsMonthlyActivityRow {
    return {
      monthStart: new Date(month),
      senderCount,
      totalMembersEndOfMonth: totalMembers,
      newMembers: 0,
      donationPointsSum: BigInt(0),
      donationTxCount: BigInt(0),
      donationChainTxCount: BigInt(0),
      // Default to "no dormant base / no returners / no hubs" —
      // the 3m avg test only exercises the rate calculation, so
      // these counters are unused. Returning the right shape keeps
      // the test compatible with the row contract.
      dormantCountEndOfMonth: 0,
      returnedMembers: null,
      hubMemberCount: 0,
    };
  }

  it("returns null with fewer than 3 months of data", () => {
    expect(computeActivityRate3mAvg([])).toBeNull();
    expect(computeActivityRate3mAvg([trendRow("2026-04-01", 1, 10)])).toBeNull();
    expect(
      computeActivityRate3mAvg([
        trendRow("2026-03-01", 1, 10),
        trendRow("2026-04-01", 2, 10),
      ]),
    ).toBeNull();
  });

  it("averages the last 3 months' rates when >= 3 months of data", () => {
    // Rates: 0.1, 0.2, 0.3 → avg 0.2
    const avg = computeActivityRate3mAvg([
      trendRow("2026-02-01", 1, 10),
      trendRow("2026-03-01", 2, 10),
      trendRow("2026-04-01", 3, 10),
    ]);
    expect(avg).toBeCloseTo(0.2);
  });

  it("uses only the TRAILING 3 months when more data exists", () => {
    // Older months (0 senders) are ignored; trailing 3 are 0.4, 0.5, 0.6.
    const avg = computeActivityRate3mAvg([
      trendRow("2025-12-01", 0, 10),
      trendRow("2026-01-01", 0, 10),
      trendRow("2026-02-01", 4, 10),
      trendRow("2026-03-01", 5, 10),
      trendRow("2026-04-01", 6, 10),
    ]);
    expect(avg).toBeCloseTo(0.5);
  });

  it("treats months with zero total_members as rate 0 (no divide-by-zero)", () => {
    // No members yet → rate 0 that month.
    const avg = computeActivityRate3mAvg([
      trendRow("2026-02-01", 0, 0),
      trendRow("2026-03-01", 2, 10),
      trendRow("2026-04-01", 3, 10),
    ]);
    expect(avg).toBeCloseTo((0 + 0.2 + 0.3) / 3);
  });
});
