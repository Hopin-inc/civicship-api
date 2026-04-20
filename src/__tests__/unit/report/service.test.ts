import "reflect-metadata";
import { ReportStatus } from "@prisma/client";
import { container } from "tsyringe";
import ReportService, {
  SKIP_REASON_NO_ACTIVITY_PREFIX,
} from "@/application/domain/report/service";
import type { WeeklyReportPayload } from "@/application/domain/report/types";

class MockReportRepository {
  findDailySummaries = jest.fn();
  findDailyActiveUsers = jest.fn();
  findTopUsersByTotalPoints = jest.fn();
  findCommentsByDateRange = jest.fn();
  findUserProfiles = jest.fn();
  findCommunityContext = jest.fn();
  findDeepestChain = jest.fn();
  refreshTransactionSummaryDaily = jest.fn();
  refreshUserTransactionDaily = jest.fn();
  findTemplate = jest.fn();
  findActiveTemplates = jest.fn();
  findJudgeTemplate = jest.fn();
  updateReportJudgeResult = jest.fn();
  findGoldenCases = jest.fn();
  upsertGoldenCase = jest.fn();
  upsertTemplate = jest.fn();
  createReport = jest.fn();
  findReportById = jest.fn();
  findReports = jest.fn();
  updateReportStatus = jest.fn();
  findReportsByParentRunId = jest.fn();
}

describe("ReportService", () => {
  let service: ReportService;

  beforeEach(() => {
    container.reset();
    container.register("ReportRepository", { useValue: new MockReportRepository() });
    service = container.resolve(ReportService);
  });

  describe("assertStatusTransition", () => {
    const validTransitions: [ReportStatus, ReportStatus][] = [
      [ReportStatus.DRAFT, ReportStatus.APPROVED],
      [ReportStatus.DRAFT, ReportStatus.REJECTED],
      [ReportStatus.DRAFT, ReportStatus.SUPERSEDED],
      [ReportStatus.APPROVED, ReportStatus.PUBLISHED],
      [ReportStatus.APPROVED, ReportStatus.REJECTED],
      [ReportStatus.APPROVED, ReportStatus.SUPERSEDED],
      [ReportStatus.PUBLISHED, ReportStatus.SUPERSEDED],
      // Force-regenerating from a SKIPPED parent needs this transition so
      // the shared supersedeParentIfRegenerating helper can mark the prior
      // row obsolete before the fresh run is persisted.
      [ReportStatus.SKIPPED, ReportStatus.SUPERSEDED],
    ];

    it.each(validTransitions)("allows %s → %s", (from, to) => {
      expect(() => service.assertStatusTransition(from, to)).not.toThrow();
    });

    const invalidTransitions: [ReportStatus, ReportStatus][] = [
      [ReportStatus.REJECTED, ReportStatus.DRAFT],
      [ReportStatus.REJECTED, ReportStatus.APPROVED],
      [ReportStatus.SUPERSEDED, ReportStatus.DRAFT],
      [ReportStatus.SUPERSEDED, ReportStatus.APPROVED],
      [ReportStatus.PUBLISHED, ReportStatus.APPROVED],
      [ReportStatus.PUBLISHED, ReportStatus.DRAFT],
      [ReportStatus.DRAFT, ReportStatus.PUBLISHED],
      // SKIPPED only admits SUPERSEDED (covered above); DRAFT / APPROVED /
      // PUBLISHED don't make sense — there is no generated content to
      // review or publish.
      [ReportStatus.SKIPPED, ReportStatus.DRAFT],
      [ReportStatus.SKIPPED, ReportStatus.APPROVED],
      [ReportStatus.SKIPPED, ReportStatus.PUBLISHED],
    ];

    it.each(invalidTransitions)("rejects %s → %s", (from, to) => {
      expect(() => service.assertStatusTransition(from, to)).toThrow(/Invalid status transition/);
    });
  });

  describe("evaluateSkipReason", () => {
    const basePayload: WeeklyReportPayload = {
      period: { from: "2026-04-11", to: "2026-04-17" },
      community_id: "kibotcha",
      community_context: {
        community_id: "kibotcha",
        name: "KIBOTCHA",
        point_name: "pt",
        bio: null,
        established_at: null,
        website: null,
        total_members: 566,
        active_users_in_window: 0,
        active_rate: 0,
        custom_context: null,
      },
      deepest_chain: null,
      daily_summaries: [],
      daily_active_users: [],
      top_users: [],
      highlight_comments: [],
      previous_period: null,
      retention: null,
    };

    it("returns a prefixed skip reason when active_users=0 AND daily_summaries is empty", () => {
      const reason = service.evaluateSkipReason(basePayload);
      expect(reason).not.toBeNull();
      expect(reason).toContain(SKIP_REASON_NO_ACTIVITY_PREFIX);
      expect(reason).toMatch(/active_users=0/);
      expect(reason).toMatch(/daily_summaries=\[\]/);
    });

    it("skips null community_context with a distinct reason sharing the same prefix", () => {
      // null community_context still buckets as "no activity" for LIKE
      // filtering, but the reason suffix differs so ops can tell a
      // community-with-no-JOINED-members apart from a dormant active one.
      const reason = service.evaluateSkipReason({
        ...basePayload,
        community_context: null,
      });
      expect(reason).not.toBeNull();
      expect(reason).toContain(SKIP_REASON_NO_ACTIVITY_PREFIX);
      expect(reason).toMatch(/community_context=null/);
      expect(reason).not.toMatch(/active_users=0,/);
    });

    it("does NOT skip when daily_summaries has rows even if active_users=0", () => {
      // Defence against drift between the two signals: if daily_summaries
      // somehow records activity but active_users_in_window reads 0 (e.g.
      // MV lag), we still want to generate a report rather than silently
      // skipping a non-empty week.
      const reason = service.evaluateSkipReason({
        ...basePayload,
        daily_summaries: [
          {
            date: "2026-04-15",
            reason: "DONATION",
            tx_count: 1,
            points_sum: 1000,
            chain_root_count: 0,
            chain_descendant_count: 1,
            max_chain_depth: 5,
            avg_chain_depth: 5,
            issuance_count: 0,
            burn_count: 0,
          },
        ],
      });
      expect(reason).toBeNull();
    });

    it("does NOT skip when active_users>0 even if daily_summaries is empty", () => {
      // Symmetric defence: the inverse drift case.
      const reason = service.evaluateSkipReason({
        ...basePayload,
        community_context: {
          ...basePayload.community_context!,
          active_users_in_window: 3,
        },
      });
      expect(reason).toBeNull();
    });

    it("does NOT skip a fully populated weekly payload", () => {
      const reason = service.evaluateSkipReason({
        ...basePayload,
        community_context: {
          ...basePayload.community_context!,
          active_users_in_window: 26,
          active_rate: 0.04,
        },
        daily_summaries: [
          {
            date: "2026-04-14",
            reason: "DONATION",
            tx_count: 8,
            points_sum: 125830,
            chain_root_count: 0,
            chain_descendant_count: 8,
            max_chain_depth: 19,
            avg_chain_depth: 5,
            issuance_count: 0,
            burn_count: 0,
          },
        ],
      });
      expect(reason).toBeNull();
    });
  });
});
