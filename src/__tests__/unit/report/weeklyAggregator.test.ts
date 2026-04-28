import "reflect-metadata";
import {
  aggregateTransactionTotals,
  computeActiveRate,
  computeAvgChainDepth,
  computeDaysSinceLastPublish,
  computeGrowthRates,
  computePageInfo,
  computeRetentionSummary,
} from "@/application/domain/report/presenter/weeklyAggregator";
import type {
  CohortRetentionRow,
  PeriodAggregateRow,
  RetentionAggregateRow,
  TransactionSummaryDailyRow,
} from "@/application/domain/report/data/interface";

/**
 * Unit-level tests for the pure functions extracted out of
 * ReportPresenter.weeklyPayload. The orchestration-level integration
 * checks live in weeklyPayload.test.ts; this file pins the rate /
 * growth math in isolation so a regression surfaces against the
 * narrowest possible API.
 */

function summary(
  overrides: Partial<TransactionSummaryDailyRow> = {},
): TransactionSummaryDailyRow {
  return {
    date: overrides.date ?? new Date("2026-04-01T00:00:00Z"),
    communityId: overrides.communityId ?? "c1",
    reason: overrides.reason ?? "DONATION",
    txCount: overrides.txCount ?? 0,
    pointsSum: overrides.pointsSum ?? 0n,
    chainRootCount: overrides.chainRootCount ?? 0,
    chainDescendantCount: overrides.chainDescendantCount ?? 0,
    sumChainDepth: overrides.sumChainDepth ?? 0,
    maxChainDepth: overrides.maxChainDepth ?? null,
    issuanceCount: overrides.issuanceCount ?? 0,
    burnCount: overrides.burnCount ?? 0,
  };
}

describe("aggregateTransactionTotals", () => {
  it("sums tx count across summaries", () => {
    const totals = aggregateTransactionTotals([
      summary({ txCount: 3, pointsSum: 100n }),
      summary({ txCount: 5, pointsSum: 200n }),
    ]);
    expect(totals.txCount).toBe(8);
    expect(totals.pointsSum).toBe(300);
  });

  it("returns zeros for an empty input", () => {
    expect(aggregateTransactionTotals([])).toEqual({ txCount: 0, pointsSum: 0 });
  });

  it("throws when the cumulative bigint sum exceeds MAX_SAFE_INTEGER", () => {
    const half = BigInt(Number.MAX_SAFE_INTEGER);
    expect(() =>
      aggregateTransactionTotals([
        summary({ pointsSum: half }),
        summary({ pointsSum: half }),
      ]),
    ).toThrow(RangeError);
  });
});

describe("computeAvgChainDepth", () => {
  it("returns null when maxChainDepth is null (non-chain row)", () => {
    expect(computeAvgChainDepth(summary({ maxChainDepth: null }))).toBeNull();
  });

  it("returns null when both root + descendant counts are zero", () => {
    expect(
      computeAvgChainDepth(
        summary({ maxChainDepth: 5, chainRootCount: 0, chainDescendantCount: 0 }),
      ),
    ).toBeNull();
  });

  it("divides sumChainDepth by root + descendant", () => {
    const out = computeAvgChainDepth(
      summary({
        maxChainDepth: 5,
        chainRootCount: 2,
        chainDescendantCount: 3,
        sumChainDepth: 10,
      }),
    );
    expect(out).toBe(2);
  });
});

describe("computeRetentionSummary", () => {
  const aggregate: RetentionAggregateRow = {
    newMembers: 4,
    retainedSenders: 3,
    returnedSenders: 1,
    churnedSenders: 2,
    currentSendersCount: 6,
    currentActiveCount: 8,
  };

  it("collapses rate fields to null when totalMembers is null", () => {
    const out = computeRetentionSummary({ aggregate, totalMembers: null, week1: null, week4: null });
    expect(out.active_rate_sender).toBeNull();
    expect(out.active_rate_any).toBeNull();
  });

  it("collapses rate fields to null when totalMembers is zero", () => {
    const out = computeRetentionSummary({ aggregate, totalMembers: 0, week1: null, week4: null });
    expect(out.active_rate_sender).toBeNull();
    expect(out.active_rate_any).toBeNull();
  });

  it("divides senders / active counts by totalMembers when positive", () => {
    const out = computeRetentionSummary({
      aggregate,
      totalMembers: 10,
      week1: null,
      week4: null,
    });
    expect(out.active_rate_sender).toBeCloseTo(0.6);
    expect(out.active_rate_any).toBeCloseTo(0.8);
  });

  it("collapses week-N retention to null when cohortSize is zero", () => {
    const week1: CohortRetentionRow = { cohortSize: 0, activeNextWeek: 0 };
    const out = computeRetentionSummary({ aggregate, totalMembers: 10, week1, week4: null });
    expect(out.week1_retention).toBeNull();
  });

  it("computes week-N retention as activeNextWeek / cohortSize when cohort exists", () => {
    const week1: CohortRetentionRow = { cohortSize: 5, activeNextWeek: 2 };
    const week4: CohortRetentionRow = { cohortSize: 4, activeNextWeek: 1 };
    const out = computeRetentionSummary({ aggregate, totalMembers: 10, week1, week4 });
    expect(out.week1_retention).toBeCloseTo(0.4);
    expect(out.week4_retention).toBeCloseTo(0.25);
  });

  it("preserves the raw aggregate counters even when rates collapse", () => {
    const out = computeRetentionSummary({ aggregate, totalMembers: null, week1: null, week4: null });
    expect(out.new_members).toBe(4);
    expect(out.retained_senders).toBe(3);
    expect(out.churned_senders).toBe(2);
    expect(out.returned_senders).toBe(1);
  });
});

describe("computeGrowthRates", () => {
  const previousAggregate: PeriodAggregateRow = {
    activeUsersInWindow: 5,
    totalTxCount: 10,
    totalPointsSum: 1000n,
    newMembers: 2,
  };

  it("nulls out active_users when communityContext was missing", () => {
    const out = computeGrowthRates({
      currentTxCount: 12,
      currentPointsSum: 1500,
      currentActiveUsers: 7,
      hasCommunityContext: false,
      previousAggregate,
    });
    expect(out.active_users).toBeNull();
    // tx_count / points_sum stay populated since they don't depend on community context.
    expect(out.tx_count).not.toBeNull();
    expect(out.points_sum).not.toBeNull();
  });

  it("computes percent change for tx_count / points_sum / active_users when present", () => {
    const out = computeGrowthRates({
      currentTxCount: 15,
      currentPointsSum: 2000,
      currentActiveUsers: 10,
      hasCommunityContext: true,
      previousAggregate,
    });
    // (15 - 10) / 10 * 100 = 50
    expect(out.tx_count).toBeCloseTo(50);
    // (2000 - 1000) / 1000 * 100 = 100
    expect(out.points_sum).toBeCloseTo(100);
    // (10 - 5) / 5 * 100 = 100
    expect(out.active_users).toBeCloseTo(100);
  });

  it("returns null growth-rate fields when previous denominators are zero", () => {
    const out = computeGrowthRates({
      currentTxCount: 1,
      currentPointsSum: 1,
      currentActiveUsers: 1,
      hasCommunityContext: true,
      previousAggregate: {
        activeUsersInWindow: 0,
        totalTxCount: 0,
        totalPointsSum: 0n,
        newMembers: 0,
      },
    });
    expect(out.tx_count).toBeNull();
    expect(out.points_sum).toBeNull();
    expect(out.active_users).toBeNull();
  });
});

describe("computePageInfo", () => {
  it("returns hasNextPage=false when items count <= requestedFirst", () => {
    const out = computePageInfo([1, 2, 3], 5);
    expect(out.hasNextPage).toBe(false);
    expect(out.page).toEqual([1, 2, 3]);
  });

  it("returns hasNextPage=true and slices to requestedFirst when items overflow", () => {
    const out = computePageInfo([1, 2, 3, 4], 3);
    expect(out.hasNextPage).toBe(true);
    expect(out.page).toEqual([1, 2, 3]);
  });
});

describe("computeDaysSinceLastPublish", () => {
  it("returns null for never-published communities", () => {
    expect(computeDaysSinceLastPublish(null, Date.now())).toBeNull();
  });

  it("returns floor((now - lastPublishedAt) / day)", () => {
    const now = new Date("2026-04-30T00:00:00Z").getTime();
    const lastPublishedAt = new Date("2026-04-25T12:00:00Z");
    // ~4.5 days → floor → 4
    expect(computeDaysSinceLastPublish(lastPublishedAt, now)).toBe(4);
  });
});

describe("computeActiveRate", () => {
  it("returns null when totalMembers is zero or negative", () => {
    expect(computeActiveRate(5, 0)).toBeNull();
    expect(computeActiveRate(5, -1)).toBeNull();
  });

  it("returns activeUsers / totalMembers when totalMembers is positive", () => {
    expect(computeActiveRate(3, 10)).toBeCloseTo(0.3);
  });
});
