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
  findMemberStatsBulk = jest.fn();
  findMonthlyActivity = jest.fn();
  findActivitySnapshot = jest.fn();
  findNewMemberCount = jest.fn();
  findWindowActivityCounts = jest.fn();
  findWindowActivityCountsBulk = jest.fn();
  findWindowHubMemberCount = jest.fn();
  findWindowHubMemberCountBulk = jest.fn();
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
  getRetentionAggregateBulk = jest.fn();
  getCohortRetention = jest.fn();
  getCohortRetentionBulk = jest.fn();
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

  // ========================================================================
  // Bulk wrappers: pin the wiring so the L1 dashboard fan-out keeps
  // collapsing to one SQL roundtrip per concern. Each test asserts both
  // the underlying repository / ReportService call shape and the
  // Map<communityId, ...> shape the usecase consumes.
  // ========================================================================
  describe("bulk wrappers", () => {
    const ctx = {} as never;
    const asOf = new Date("2026-04-30T15:00:00Z");

    it("getMemberStatsBulk forwards to findMemberStatsBulk", async () => {
      const map = new Map([["c1", []]]);
      repo.findMemberStatsBulk.mockResolvedValueOnce(map);
      const result = await service.getMemberStatsBulk(ctx, ["c1"], asOf);
      expect(repo.findMemberStatsBulk).toHaveBeenCalledWith(ctx, ["c1"], asOf);
      expect(result).toBe(map);
    });

    it("getWindowActivityBulk computes the same window bounds as the single-row variant", async () => {
      // Pin the bounds so a regression in service-level date math
      // breaks here before the L1 vs L2 numbers desync.
      repo.findWindowActivityCountsBulk.mockResolvedValueOnce(new Map());
      await service.getWindowActivityBulk(ctx, ["c1", "c2"], asOf, 28);
      expect(repo.findWindowActivityCountsBulk).toHaveBeenCalledTimes(1);
      const [, ids, prevLower, currLower, upper] =
        repo.findWindowActivityCountsBulk.mock.calls[0];
      expect(ids).toEqual(["c1", "c2"]);
      // upper - currLower === windowDays === currLower - prevLower
      const day = 24 * 60 * 60 * 1000;
      expect(upper.getTime() - currLower.getTime()).toBe(28 * day);
      expect(currLower.getTime() - prevLower.getTime()).toBe(28 * day);
    });

    it("getWindowHubMemberCountBulk extracts numeric counts and defaults missing ids to 0", async () => {
      repo.findWindowHubMemberCountBulk.mockResolvedValueOnce(
        new Map([
          ["c1", { count: 5 }],
          ["c2", { count: 0 }],
        ]),
      );
      const result = await service.getWindowHubMemberCountBulk(
        ctx,
        ["c1", "c2", "c3-missing"],
        asOf,
        28,
        3,
      );
      expect(result.get("c1")).toBe(5);
      expect(result.get("c2")).toBe(0);
      expect(result.get("c3-missing")).toBe(0);
    });

    it("getWeeklyRetentionBulk extracts retained / churned per community and zero-fills misses", async () => {
      reportService.getRetentionAggregateBulk.mockResolvedValueOnce(
        new Map([
          [
            "c1",
            {
              newMembers: 0,
              retainedSenders: 7,
              returnedSenders: 0,
              churnedSenders: 3,
              currentSendersCount: 0,
              currentActiveCount: 0,
            },
          ],
        ]),
      );
      const result = await service.getWeeklyRetentionBulk(
        ctx,
        ["c1", "c2-missing"],
        asOf,
      );
      expect(result.get("c1")).toEqual({ retainedSenders: 7, churnedSenders: 3 });
      expect(result.get("c2-missing")).toEqual({ retainedSenders: 0, churnedSenders: 0 });
    });

    it("getLatestCohortBulk extracts size / activeAtM1 per community and zero-fills misses", async () => {
      reportService.getCohortRetentionBulk.mockResolvedValueOnce(
        new Map([
          ["c1", { cohortSize: 12, activeNextWeek: 5 }],
        ]),
      );
      const result = await service.getLatestCohortBulk(ctx, ["c1", "c2-missing"], asOf);
      expect(result.get("c1")).toEqual({ size: 12, activeAtM1: 5 });
      expect(result.get("c2-missing")).toEqual({ size: 0, activeAtM1: 0 });
    });
  });
});
