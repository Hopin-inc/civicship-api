import "reflect-metadata";
import SysAdminPresenter from "@/application/domain/sysadmin/presenter";
import type {
  SysAdminAllTimeTotalsRow,
  SysAdminMemberStatsRow,
  SysAdminMonthlyActivityRow,
  SysAdminPlatformTotalsRow,
} from "@/application/domain/sysadmin/data/type";
import type {
  AlertFlags,
  MemberListResult,
  MonthlyCohortPoint,
  StageBreakdown,
  StageCounts,
  WeeklyRetentionPoint,
} from "@/application/domain/sysadmin/service";

/**
 * Presenter is a pure shape-mapper. These tests lock in the contract
 * that the repository's bigint fields route through bigintToSafeNumber
 * (blowing up on overflow) and that null propagation is preserved
 * through to the GraphQL payload.
 */
describe("SysAdminPresenter", () => {
  describe("platform / summaryCard / memberRow — bigint handling", () => {
    it("converts latestMonthDonationPoints bigint to a plain number", () => {
      const row: SysAdminPlatformTotalsRow = {
        communitiesCount: 6,
        totalMembers: 500,
        latestMonthDonationPoints: BigInt(1_234_567),
      };
      const out = SysAdminPresenter.platform(row);
      expect(out.latestMonthDonationPoints).toBe(1_234_567);
      expect(typeof out.latestMonthDonationPoints).toBe("number");
    });

    it("throws RangeError when a DONATION total overflows Number.MAX_SAFE_INTEGER", () => {
      // bigintToSafeNumber is the safety net for external-reporting
      // totals. Silent precision loss would corrupt "累計流通ポイント"
      // downstream, so failing loud is intentional.
      const overflow: SysAdminPlatformTotalsRow = {
        communitiesCount: 1,
        totalMembers: 1,
        latestMonthDonationPoints: BigInt(Number.MAX_SAFE_INTEGER) + BigInt(1),
      };
      expect(() => SysAdminPresenter.platform(overflow)).toThrow(RangeError);
    });

    it("converts totalPointsOut on member rows", () => {
      const row: SysAdminMemberStatsRow = {
        userId: "u1",
        name: "Alice",
        monthsIn: 12,
        donationOutMonths: 10,
        userSendRate: 0.833,
        totalPointsOut: BigInt(5_000),
      };
      const out = SysAdminPresenter.memberRow(row);
      expect(out.totalPointsOut).toBe(5_000);
      expect(typeof out.totalPointsOut).toBe("number");
    });

    it("passes null name through untouched", () => {
      const row: SysAdminMemberStatsRow = {
        userId: "u1",
        name: null,
        monthsIn: 1,
        donationOutMonths: 0,
        userSendRate: 0,
        totalPointsOut: BigInt(0),
      };
      expect(SysAdminPresenter.memberRow(row).name).toBeNull();
    });
  });

  describe("summaryCard — null propagation & tier2Pct", () => {
    function allTimeTotals(
      overrides: Partial<SysAdminAllTimeTotalsRow> = {},
    ): SysAdminAllTimeTotalsRow {
      return {
        totalDonationPoints: overrides.totalDonationPoints ?? BigInt(0),
        maxChainDepth: overrides.maxChainDepth ?? null,
        dataFrom: overrides.dataFrom ?? null,
        dataTo: overrides.dataTo ?? null,
      };
    }

    it("keeps null values null (growthRateActivity, maxChainDepth, dataFrom/To, 3m avg)", () => {
      const out = SysAdminPresenter.summaryCard({
        communityId: "c1",
        communityName: "C",
        totalMembers: 10,
        communityActivityRate: 0.3,
        communityActivityRate3mAvg: null,
        growthRateActivity: null,
        tier2Count: 4,
        allTimeTotals: allTimeTotals(),
      });
      expect(out.communityActivityRate3mAvg).toBeNull();
      expect(out.growthRateActivity).toBeNull();
      expect(out.maxChainDepthAllTime).toBeNull();
      expect(out.dataFrom).toBeNull();
      expect(out.dataTo).toBeNull();
    });

    it("computes tier2Pct = tier2Count / totalMembers", () => {
      const out = SysAdminPresenter.summaryCard({
        communityId: "c1",
        communityName: "C",
        totalMembers: 10,
        communityActivityRate: 0.5,
        communityActivityRate3mAvg: 0.4,
        growthRateActivity: 0.1,
        tier2Count: 3,
        allTimeTotals: allTimeTotals({ totalDonationPoints: BigInt(0) }),
      });
      expect(out.tier2Pct).toBeCloseTo(0.3);
    });

    it("returns tier2Pct=0 when totalMembers is 0 (no divide-by-zero)", () => {
      const out = SysAdminPresenter.summaryCard({
        communityId: "c1",
        communityName: "C",
        totalMembers: 0,
        communityActivityRate: 0,
        communityActivityRate3mAvg: null,
        growthRateActivity: null,
        tier2Count: 0,
        allTimeTotals: allTimeTotals(),
      });
      expect(out.tier2Pct).toBe(0);
    });
  });

  describe("monthlyActivityPoint — chainPct & divide-by-zero guards", () => {
    const baseRow: SysAdminMonthlyActivityRow = {
      monthStart: new Date(Date.UTC(2026, 3, 1)),
      senderCount: 0,
      totalMembersEndOfMonth: 0,
      newMembers: 0,
      donationPointsSum: BigInt(0),
      donationTxCount: BigInt(0),
      donationChainTxCount: BigInt(0),
    };

    it("returns null chainPct when no DONATION tx occurred that month", () => {
      const out = SysAdminPresenter.monthlyActivityPoint({
        ...baseRow,
        donationTxCount: BigInt(0),
        donationChainTxCount: BigInt(0),
      });
      expect(out.chainPct).toBeNull();
    });

    it("returns rate 0 when total_members is 0 (no divide-by-zero)", () => {
      const out = SysAdminPresenter.monthlyActivityPoint({
        ...baseRow,
        senderCount: 0,
        totalMembersEndOfMonth: 0,
      });
      expect(out.communityActivityRate).toBe(0);
    });

    it("computes rate & chainPct as fractions", () => {
      const out = SysAdminPresenter.monthlyActivityPoint({
        ...baseRow,
        senderCount: 4,
        totalMembersEndOfMonth: 20,
        donationTxCount: BigInt(10),
        donationChainTxCount: BigInt(3),
        donationPointsSum: BigInt(5_000),
      });
      expect(out.communityActivityRate).toBeCloseTo(0.2);
      expect(out.chainPct).toBeCloseTo(0.3);
      expect(out.donationPointsSum).toBe(5_000);
    });

    it("throws RangeError when donation tx count overflows safe integer", () => {
      // ::bigint on the SUM keeps the SQL side safe; the presenter
      // should fail loud (not silently truncate) if cumulative tx
      // counts somehow exceed Number.MAX_SAFE_INTEGER.
      expect(() =>
        SysAdminPresenter.monthlyActivityPoint({
          ...baseRow,
          donationTxCount: BigInt(Number.MAX_SAFE_INTEGER) + BigInt(1),
          donationChainTxCount: BigInt(0),
        }),
      ).toThrow(RangeError);
    });
  });

  describe("retentionTrendPoint / cohortPoint — null passthrough", () => {
    it("retention trend keeps null activity rate when week had no members", () => {
      const point: WeeklyRetentionPoint = {
        weekStart: new Date(Date.UTC(2026, 3, 20)),
        retainedSenders: 0,
        churnedSenders: 0,
        returnedSenders: 0,
        newMembers: 0,
        communityActivityRate: null,
      };
      expect(SysAdminPresenter.retentionTrendPoint(point).communityActivityRate).toBeNull();
    });

    it("cohortPoint keeps individual retentionMN null fields (too-recent cohort)", () => {
      const point: MonthlyCohortPoint = {
        cohortMonthStart: new Date(Date.UTC(2026, 3, 1)),
        cohortSize: 10,
        retentionM1: 0.3,
        retentionM3: null,
        retentionM6: null,
      };
      const out = SysAdminPresenter.cohortPoint(point);
      expect(out.retentionM1).toBeCloseTo(0.3);
      expect(out.retentionM3).toBeNull();
      expect(out.retentionM6).toBeNull();
    });
  });

  describe("memberList / stages — passthrough structure", () => {
    it("passes hasNextPage + nextCursor untouched", () => {
      const result: MemberListResult = {
        users: [
          {
            userId: "u",
            name: "Alice",
            monthsIn: 1,
            donationOutMonths: 1,
            userSendRate: 1,
            totalPointsOut: BigInt(0),
          },
        ],
        hasNextPage: true,
        nextCursor: "MQ==",
      };
      const out = SysAdminPresenter.memberList(result);
      expect(out.hasNextPage).toBe(true);
      expect(out.nextCursor).toBe("MQ==");
      expect(out.users).toHaveLength(1);
    });

    it("nextCursor stays null when there is no next page", () => {
      const out = SysAdminPresenter.memberList({
        users: [],
        hasNextPage: false,
        nextCursor: null,
      });
      expect(out.nextCursor).toBeNull();
    });

    it("stages mirrors the service breakdown buckets 1:1", () => {
      const zeroBucket = {
        count: 0,
        pct: 0,
        pointsContributionPct: 0,
        avgSendRate: 0,
        avgMonthsIn: 0,
      };
      const bd: StageBreakdown = {
        habitual: { ...zeroBucket, count: 2, pct: 0.2, avgSendRate: 0.8 },
        regular: { ...zeroBucket, count: 3, pct: 0.3 },
        occasional: { ...zeroBucket, count: 1, pct: 0.1 },
        latent: { ...zeroBucket, count: 4, pct: 0.4 },
      };
      const out = SysAdminPresenter.stages(bd);
      expect(out.habitual.count).toBe(2);
      expect(out.regular.count).toBe(3);
      expect(out.occasional.count).toBe(1);
      expect(out.latent.count).toBe(4);
      expect(out.latent.pointsContributionPct).toBe(0);
    });
  });

  describe("overviewRow — cumulative count passthrough", () => {
    it("copies tier1/tier2/passive counts to BOTH segmentCounts and top-level convenience fields", () => {
      const counts: StageCounts = {
        total: 10,
        tier1Count: 2,
        tier2Count: 5,
        activeCount: 7,
        passiveCount: 3,
      };
      const alerts: AlertFlags = {
        churnSpike: false,
        activeDrop: true,
        noNewMembers: false,
      };
      const out = SysAdminPresenter.overviewRow({
        communityId: "c1",
        communityName: "C",
        totalMembers: 10,
        stageCounts: counts,
        communityActivityRate: 0.3,
        growthRateActivity: -0.25,
        latestCohortRetentionM1: 0.5,
        alerts,
      });
      expect(out.tier1Count).toBe(2);
      expect(out.segmentCounts.tier1Count).toBe(2);
      expect(out.tier2Count).toBe(5);
      expect(out.segmentCounts.tier2Count).toBe(5);
      expect(out.passiveCount).toBe(3);
      expect(out.segmentCounts.passiveCount).toBe(3);
      expect(out.alerts.activeDrop).toBe(true);
    });
  });
});
