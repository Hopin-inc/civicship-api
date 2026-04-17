import "reflect-metadata";
import { ReportStatus } from "@prisma/client";
import { container } from "tsyringe";
import ReportService from "@/application/domain/report/service";

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
    ];

    it.each(invalidTransitions)("rejects %s → %s", (from, to) => {
      expect(() => service.assertStatusTransition(from, to)).toThrow(/Invalid status transition/);
    });
  });
});
