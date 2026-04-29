import "reflect-metadata";
import { container } from "tsyringe";
import AnalyticsCommunityService from "@/application/domain/analytics/community/service";

/**
 * Minimal mock repositories. `jest.fn()` everywhere so tests can
 * assert call shape AND return canned rows. The orchestrator-level
 * alert test below installs return values explicitly.
 */
class MockAnalyticsCommunityRepository {
  findAllCommunities = jest.fn();
  findCommunityById = jest.fn();
  findMemberStats = jest.fn();
  findMonthlyActivity = jest.fn();
  findActivitySnapshot = jest.fn();
  findNewMemberCount = jest.fn();
  findWindowActivityCounts = jest.fn();
  findWindowHubMemberCount = jest.fn();
  findAllTimeTotals = jest.fn();
  findPlatformTotals = jest.fn();
  findChainDepthDistribution = jest.fn();
}

/**
 * Stub the few ReportService wrappers AnalyticsCommunityService leans on.
 * Per CLAUDE.md the cross-domain boundary is the service, not the
 * repository, so the test follows the same boundary.
 */
class MockReportService {
  getRetentionAggregate = jest.fn();
  getCohortRetention = jest.fn();
}

describe("AnalyticsCommunityService", () => {
  let service: AnalyticsCommunityService;
  let repo: MockAnalyticsCommunityRepository;
  let reportService: MockReportService;

  beforeEach(() => {
    container.reset();
    repo = new MockAnalyticsCommunityRepository();
    reportService = new MockReportService();
    container.register("AnalyticsCommunityRepository", { useValue: repo });
    container.register("ReportService", { useValue: reportService });
    service = container.resolve(AnalyticsCommunityService);
  });

  // ========================================================================
  // getMonthlyActivity: forwards hubBreadthThreshold to repository
  // ========================================================================
  describe("getMonthlyActivity threshold passthrough", () => {
    it("passes hubBreadthThreshold through to findMonthlyActivity unchanged", async () => {
      // The L1 invariant ("latest month hubMemberCount === L1
      // hubMemberCount when both queries pass the same threshold")
      // depends on the service forwarding the threshold verbatim.
      // Pin the wiring here so a future refactor that drops or
      // remaps the threshold breaks loudly at the unit level
      // before it can desync the L1/L2 contract.
      repo.findMonthlyActivity.mockResolvedValueOnce([]);
      const ctx = {} as never;
      const asOf = new Date("2026-04-30T15:00:00Z");
      await service.getMonthlyActivity(ctx, "community-1", asOf, 10, 5);
      expect(repo.findMonthlyActivity).toHaveBeenCalledWith(ctx, "community-1", asOf, 10, 5);
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
