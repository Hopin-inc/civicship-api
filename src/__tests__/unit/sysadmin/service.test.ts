import "reflect-metadata";
import { container } from "tsyringe";
import SysAdminService, {
  DEFAULT_SEGMENT_THRESHOLDS,
} from "@/application/domain/sysadmin/service";
import type {
  SysAdminMemberStatsRow,
  SysAdminMonthlyActivityRow,
} from "@/application/domain/sysadmin/data/type";

/**
 * Member factory keeps the tests readable — every test below really
 * only cares about 2–3 fields, so the helper defaults the rest to
 * non-interesting values.
 */
function member(overrides: Partial<SysAdminMemberStatsRow>): SysAdminMemberStatsRow {
  return {
    userId: overrides.userId ?? "u",
    name: overrides.name ?? null,
    monthsIn: overrides.monthsIn ?? 1,
    donationOutMonths: overrides.donationOutMonths ?? 0,
    totalPointsOut: overrides.totalPointsOut ?? BigInt(0),
    userSendRate: overrides.userSendRate ?? 0,
    uniqueDonationRecipients: overrides.uniqueDonationRecipients ?? 0,
  };
}

/**
 * Minimal mock repositories. `jest.fn()` everywhere so tests can
 * assert call shape AND return canned rows. The orchestrator-level
 * alert test below installs return values explicitly.
 */
class MockSysAdminRepository {
  findAllCommunities = jest.fn();
  findCommunityById = jest.fn();
  findMemberStats = jest.fn();
  findMonthlyActivity = jest.fn();
  findActivitySnapshot = jest.fn();
  findNewMemberCount = jest.fn();
  findWindowActivityCounts = jest.fn();
  findAllTimeTotals = jest.fn();
  findPlatformTotals = jest.fn();
}

/**
 * Stub the few ReportService wrappers SysAdminService leans on.
 * Per CLAUDE.md the cross-domain boundary is the service, not the
 * repository, so the test follows the same boundary.
 */
class MockReportService {
  getRetentionAggregate = jest.fn();
  getCohortRetention = jest.fn();
}

describe("SysAdminService", () => {
  let service: SysAdminService;
  let repo: MockSysAdminRepository;
  let reportService: MockReportService;

  beforeEach(() => {
    container.reset();
    repo = new MockSysAdminRepository();
    reportService = new MockReportService();
    container.register("SysAdminRepository", { useValue: repo });
    container.register("ReportService", { useValue: reportService });
    service = container.resolve(SysAdminService);
  });

  // ========================================================================
  // computeStageCounts: cumulative (tier2 includes tier1)
  // ========================================================================
  describe("computeStageCounts", () => {
    it("classifies members by the supplied thresholds with cumulative tiers", () => {
      // userSendRate: 0 (latent), 0.3 (occasional), 0.5 (regular),
      // 0.8 (habitual). Default thresholds tier1=0.7, tier2=0.4.
      const members = [
        member({ userId: "a", donationOutMonths: 0, userSendRate: 0 }),
        member({ userId: "b", donationOutMonths: 1, userSendRate: 0.3 }),
        member({ userId: "c", donationOutMonths: 2, userSendRate: 0.5 }),
        member({ userId: "d", donationOutMonths: 5, userSendRate: 0.8 }),
      ];
      const counts = service.computeStageCounts(members, DEFAULT_SEGMENT_THRESHOLDS);
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
      const members = [
        member({ userId: "a", donationOutMonths: 0, userSendRate: 0.9 }),
      ];
      const counts = service.computeStageCounts(members, DEFAULT_SEGMENT_THRESHOLDS);
      expect(counts.passiveCount).toBe(1);
      expect(counts.tier1Count).toBe(0);
      expect(counts.activeCount).toBe(0);
    });

    it("exactly-at-threshold rows are INCLUDED (>= comparison)", () => {
      // userSendRate == tier1 exactly should count as habitual.
      const members = [
        member({ userId: "a", donationOutMonths: 7, userSendRate: 0.7 }),
        member({ userId: "b", donationOutMonths: 4, userSendRate: 0.4 }),
      ];
      const counts = service.computeStageCounts(members, DEFAULT_SEGMENT_THRESHOLDS);
      expect(counts.tier1Count).toBe(1);
      expect(counts.tier2Count).toBe(2);
    });

    it("empty member list yields all-zero counts", () => {
      expect(service.computeStageCounts([], DEFAULT_SEGMENT_THRESHOLDS)).toEqual({
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
      const counts = service.computeStageCounts(members, { tier1: 0.5, tier2: 0.3 });
      expect(counts.tier1Count).toBe(2);
      expect(counts.tier2Count).toBe(2);
    });
  });

  // ========================================================================
  // computeStageBreakdown: disjoint buckets sum to 100%
  // ========================================================================
  describe("computeStageBreakdown", () => {
    it("splits members into 4 disjoint buckets whose counts sum to total", () => {
      const members = [
        member({ userId: "a", donationOutMonths: 0, userSendRate: 0 }), // latent
        member({ userId: "b", donationOutMonths: 1, userSendRate: 0.3 }), // occasional
        member({ userId: "c", donationOutMonths: 2, userSendRate: 0.5 }), // regular
        member({ userId: "d", donationOutMonths: 7, userSendRate: 0.9 }), // habitual
      ];
      const bd = service.computeStageBreakdown(members, DEFAULT_SEGMENT_THRESHOLDS);
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
        member({ userId: "a", donationOutMonths: 0 }),
        member({ userId: "b", donationOutMonths: 0 }),
        member({ userId: "c", donationOutMonths: 3, userSendRate: 0.4 }),
        member({ userId: "d", donationOutMonths: 7, userSendRate: 0.8 }),
      ];
      const bd = service.computeStageBreakdown(members, DEFAULT_SEGMENT_THRESHOLDS);
      expect(
        bd.latent.pct + bd.occasional.pct + bd.regular.pct + bd.habitual.pct,
      ).toBeCloseTo(1.0);
    });

    it("pointsContributionPct is 0 for latent and sums to 1.0 over non-latent buckets", () => {
      // Habitual: 700pt, regular: 200pt, occasional: 100pt. Total 1000.
      const members = [
        member({ userId: "a", donationOutMonths: 0, totalPointsOut: BigInt(0) }),
        member({
          userId: "b",
          donationOutMonths: 1,
          userSendRate: 0.3,
          totalPointsOut: BigInt(100),
        }),
        member({
          userId: "c",
          donationOutMonths: 4,
          userSendRate: 0.5,
          totalPointsOut: BigInt(200),
        }),
        member({
          userId: "d",
          donationOutMonths: 7,
          userSendRate: 0.9,
          totalPointsOut: BigInt(700),
        }),
      ];
      const bd = service.computeStageBreakdown(members, DEFAULT_SEGMENT_THRESHOLDS);
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
      const bd = service.computeStageBreakdown(members, DEFAULT_SEGMENT_THRESHOLDS);
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
      const bd = service.computeStageBreakdown([], DEFAULT_SEGMENT_THRESHOLDS);
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
  // paginateMembers: in-memory filter + sort + slice
  // ========================================================================
  describe("paginateMembers", () => {
    const baseMembers: SysAdminMemberStatsRow[] = [
      member({ userId: "a", userSendRate: 0.9, monthsIn: 10, donationOutMonths: 9 }),
      member({ userId: "b", userSendRate: 0.5, monthsIn: 8, donationOutMonths: 4 }),
      member({ userId: "c", userSendRate: 0.2, monthsIn: 5, donationOutMonths: 1 }),
      member({ userId: "d", userSendRate: 0, monthsIn: 3, donationOutMonths: 0 }),
    ];

    it("filters on minSendRate (inclusive)", () => {
      const { users } = service.paginateMembers(baseMembers, {
        minSendRate: 0.5,
        sortField: "SEND_RATE",
        sortOrder: "DESC",
        limit: 50,
      });
      expect(users.map((u) => u.userId)).toEqual(["a", "b"]);
    });

    it("filters on minMonthsIn AND minDonationOutMonths simultaneously", () => {
      const { users } = service.paginateMembers(baseMembers, {
        minSendRate: 0,
        minMonthsIn: 6,
        minDonationOutMonths: 2,
        sortField: "SEND_RATE",
        sortOrder: "DESC",
        limit: 50,
      });
      // `a` (monthsIn=10, donationOutMonths=9) and `b` (monthsIn=8,
      // donationOutMonths=4) both pass. Default sort is SEND_RATE DESC,
      // so `a` (0.9) ahead of `b` (0.5).
      expect(users.map((u) => u.userId)).toEqual(["a", "b"]);
    });

    it("respects maxSendRate as an inclusive upper bound", () => {
      const { users } = service.paginateMembers(baseMembers, {
        minSendRate: 0,
        maxSendRate: 0.5,
        sortField: "SEND_RATE",
        sortOrder: "DESC",
        limit: 50,
      });
      // 0.9 is excluded; 0.5, 0.2, 0 included.
      expect(users.map((u) => u.userId)).toEqual(["b", "c", "d"]);
    });

    it("sorts by SEND_RATE DESC by default and paginates via cursor", () => {
      const page1 = service.paginateMembers(baseMembers, {
        minSendRate: 0,
        sortField: "SEND_RATE",
        sortOrder: "DESC",
        limit: 2,
      });
      expect(page1.users.map((u) => u.userId)).toEqual(["a", "b"]);
      expect(page1.hasNextPage).toBe(true);
      expect(page1.nextCursor).not.toBeNull();

      const page2 = service.paginateMembers(baseMembers, {
        minSendRate: 0,
        sortField: "SEND_RATE",
        sortOrder: "DESC",
        limit: 2,
        cursor: page1.nextCursor!,
      });
      expect(page2.users.map((u) => u.userId)).toEqual(["c", "d"]);
      expect(page2.hasNextPage).toBe(false);
      expect(page2.nextCursor).toBeNull();
    });

    it("sorts by MONTHS_IN ASC", () => {
      const { users } = service.paginateMembers(baseMembers, {
        minSendRate: 0,
        sortField: "MONTHS_IN",
        sortOrder: "ASC",
        limit: 50,
      });
      expect(users.map((u) => u.userId)).toEqual(["d", "c", "b", "a"]);
    });

    it("ties break deterministically on userId (stable cursor)", () => {
      const tied = [
        member({ userId: "zzz", userSendRate: 0.5 }),
        member({ userId: "aaa", userSendRate: 0.5 }),
        member({ userId: "mmm", userSendRate: 0.5 }),
      ];
      const { users } = service.paginateMembers(tied, {
        minSendRate: 0,
        sortField: "SEND_RATE",
        sortOrder: "DESC",
        limit: 50,
      });
      // Same send-rate → fallback to userId ASC.
      expect(users.map((u) => u.userId)).toEqual(["aaa", "mmm", "zzz"]);
    });

    it("clamps limit to MAX_LIMIT upper bound and 1 lower bound", () => {
      const page = service.paginateMembers(baseMembers, {
        minSendRate: 0,
        sortField: "SEND_RATE",
        sortOrder: "DESC",
        limit: 100000,
      });
      expect(page.users.length).toBe(4); // all rows fit
      expect(page.hasNextPage).toBe(false);
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
    ): SysAdminMonthlyActivityRow {
      return {
        monthStart: new Date(month),
        senderCount,
        totalMembersEndOfMonth: totalMembers,
        newMembers: 0,
        donationPointsSum: BigInt(0),
        donationTxCount: BigInt(0),
        donationChainTxCount: BigInt(0),
      };
    }

    it("returns null with fewer than 3 months of data", () => {
      expect(service.computeActivityRate3mAvg([])).toBeNull();
      expect(service.computeActivityRate3mAvg([trendRow("2026-04-01", 1, 10)])).toBeNull();
      expect(
        service.computeActivityRate3mAvg([
          trendRow("2026-03-01", 1, 10),
          trendRow("2026-04-01", 2, 10),
        ]),
      ).toBeNull();
    });

    it("averages the last 3 months' rates when >= 3 months of data", () => {
      // Rates: 0.1, 0.2, 0.3 → avg 0.2
      const avg = service.computeActivityRate3mAvg([
        trendRow("2026-02-01", 1, 10),
        trendRow("2026-03-01", 2, 10),
        trendRow("2026-04-01", 3, 10),
      ]);
      expect(avg).toBeCloseTo(0.2);
    });

    it("uses only the TRAILING 3 months when more data exists", () => {
      // Older months (0 senders) are ignored; trailing 3 are 0.4, 0.5, 0.6.
      const avg = service.computeActivityRate3mAvg([
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
      const avg = service.computeActivityRate3mAvg([
        trendRow("2026-02-01", 0, 0),
        trendRow("2026-03-01", 2, 10),
        trendRow("2026-04-01", 3, 10),
      ]);
      expect(avg).toBeCloseTo((0 + 0.2 + 0.3) / 3);
    });
  });

  // ========================================================================
  // getAlerts: last-completed-period churnSpike + activeDrop, 14-day
  // no-new-members. Alert frame was deliberately shifted back so the
  // in-progress week/month doesn't trigger false positives.
  // ========================================================================
  describe("getAlerts", () => {
    const ctx = {} as never;
    const asOf = new Date("2026-04-21T00:00:00Z");

    function setup(params: {
      retention: { retainedSenders: number; churnedSenders: number };
      newMemberCount: number;
      prevMonth: { senderCount: number; totalMembers: number };
      prevPrevMonth: { senderCount: number; totalMembers: number };
    }) {
      reportService.getRetentionAggregate.mockResolvedValue({
        newMembers: 0,
        retainedSenders: params.retention.retainedSenders,
        returnedSenders: 0,
        churnedSenders: params.retention.churnedSenders,
        currentSendersCount: 0,
        currentActiveCount: 0,
      });
      repo.findNewMemberCount.mockResolvedValue({ count: params.newMemberCount });
      // First findActivitySnapshot call is prev month, second is prev-prev.
      repo.findActivitySnapshot
        .mockResolvedValueOnce(params.prevMonth)
        .mockResolvedValueOnce(params.prevPrevMonth);
    }

    const neutralMonths = {
      prevMonth: { senderCount: 1, totalMembers: 10 }, // 10% rate
      prevPrevMonth: { senderCount: 1, totalMembers: 10 }, // 10% rate — no change
    };

    it("fires churnSpike when churned > retained, not when equal", async () => {
      setup({
        retention: { retainedSenders: 5, churnedSenders: 6 },
        newMemberCount: 10,
        ...neutralMonths,
      });
      expect((await service.getAlerts(ctx, "c1", asOf)).churnSpike).toBe(true);

      setup({
        retention: { retainedSenders: 5, churnedSenders: 5 },
        newMemberCount: 10,
        ...neutralMonths,
      });
      expect((await service.getAlerts(ctx, "c1", asOf)).churnSpike).toBe(false);
    });

    it("fires activeDrop when prev month's rate dropped <=-20% vs prev-prev month", async () => {
      // prevPrevRate = 10/10 = 1.0, prevRate = 7/10 = ~0.7 → change ~-30%
      // (the -20% exact boundary is avoided here because JS double
      // representation of e.g. (0.8 - 1.0) / 1.0 lands at -0.199999… so
      // equality on the threshold is flaky; -30% is safely past it).
      setup({
        retention: { retainedSenders: 1, churnedSenders: 0 },
        newMemberCount: 10,
        prevMonth: { senderCount: 7, totalMembers: 10 },
        prevPrevMonth: { senderCount: 10, totalMembers: 10 },
      });
      expect((await service.getAlerts(ctx, "c1", asOf)).activeDrop).toBe(true);

      // prevRate = 0.81, prevPrevRate = 1.0 → -19% → above threshold
      setup({
        retention: { retainedSenders: 1, churnedSenders: 0 },
        newMemberCount: 10,
        prevMonth: { senderCount: 81, totalMembers: 100 },
        prevPrevMonth: { senderCount: 100, totalMembers: 100 },
      });
      expect((await service.getAlerts(ctx, "c1", asOf)).activeDrop).toBe(false);
    });

    it("does NOT fire activeDrop when prev-prev month has no data (nothing to compare)", async () => {
      setup({
        retention: { retainedSenders: 1, churnedSenders: 0 },
        newMemberCount: 10,
        prevMonth: { senderCount: 0, totalMembers: 10 },
        prevPrevMonth: { senderCount: 0, totalMembers: 0 },
      });
      expect((await service.getAlerts(ctx, "c1", asOf)).activeDrop).toBe(false);
    });

    it("fires noNewMembers when the 14-day count is zero", async () => {
      setup({
        retention: { retainedSenders: 1, churnedSenders: 0 },
        newMemberCount: 0,
        ...neutralMonths,
      });
      expect((await service.getAlerts(ctx, "c1", asOf)).noNewMembers).toBe(true);

      setup({
        retention: { retainedSenders: 1, churnedSenders: 0 },
        newMemberCount: 1,
        ...neutralMonths,
      });
      expect((await service.getAlerts(ctx, "c1", asOf)).noNewMembers).toBe(false);
    });
  });
});
