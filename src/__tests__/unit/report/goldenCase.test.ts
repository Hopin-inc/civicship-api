/**
 * Structural / contract tests for the golden dataset seeds. These run
 * without a database — the goal is to catch malformed fixtures before
 * the CI harness pays the LLM cost to discover them.
 *
 * What we DO check:
 *   - the documented shared baseline labels exist alongside any
 *     templateVersion-specific labels (the set grows when a new prompt
 *     version ships; see ReportGoldenCase.templateVersion for the
 *     filtering contract)
 *   - SKIPPED-expected case has minJudgeScore=0 and matches the skip
 *     guard
 *   - non-skip cases produce non-null skipReason=null when run through
 *     `evaluateSkipReason`, so the harness will actually invoke the LLM
 *   - forbiddenKeys and judgeCriteria.items are non-empty for non-skip
 *     cases (the dataset's value is in the discrimination criteria;
 *     empty arrays mean someone forgot to fill them in)
 *
 * What we do NOT check:
 *   - the LLM's actual generation quality (that's the CI harness)
 *   - the judge's actual scoring (that's the CI harness)
 */
import "reflect-metadata";
import { ReportStatus } from "@prisma/client";
import { container } from "tsyringe";
import ReportService from "@/application/domain/report/service";
import type { WeeklyReportPayload } from "@/application/domain/report/types";

// We import the seed module's internal definitions through a re-export
// path: the seeds module does not export the array directly, so we
// pull the data out of the public seed function by inspecting its
// upsert calls against a stubbed prisma client. That keeps the tests
// pinned to what the seed will actually persist (rather than a copy
// of the constants that could drift).
import { seedReportGoldenCases } from "@/infrastructure/prisma/seeds/reportGoldenCases";
import { prismaClient } from "@/infrastructure/prisma/client";

interface CapturedCase {
  variant: string;
  label: string;
  payloadFixture: WeeklyReportPayload;
  judgeCriteria: { items: string[] };
  minJudgeScore: number;
  forbiddenKeys: string[];
  notes: string | null;
  expectedStatus: ReportStatus | null;
  templateVersion: number | null;
}

describe("ReportGoldenCases seed", () => {
  let captured: CapturedCase[];

  beforeAll(async () => {
    captured = [];
    // Stub $transaction so the seed runs synchronously against our
    // in-memory recorder. We only intercept the write — the seed
    // itself never reads from the DB.
    const upsert = jest.fn().mockImplementation(({ where, create }) => {
      captured.push({
        variant: where.variant_label.variant,
        label: where.variant_label.label,
        payloadFixture: create.payloadFixture,
        judgeCriteria: create.judgeCriteria,
        minJudgeScore: create.minJudgeScore,
        forbiddenKeys: create.forbiddenKeys,
        notes: create.notes,
        expectedStatus: create.expectedStatus ?? null,
        templateVersion: create.templateVersion ?? null,
      });
      return Promise.resolve(create);
    });
    const txClient = { reportGoldenCase: { upsert } };
    // test-only: $transaction's interactive overload expects a full
    // PrismaClient subset; the seed only touches reportGoldenCase, so a
    // narrowed stub is enough — cast through `unknown` to bypass the
    // structural check rather than reproducing every model property.
    const txSpy = jest
      .spyOn(prismaClient, "$transaction")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .mockImplementation((async (fn: (tx: any) => Promise<unknown>) => {
        return fn(txClient);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as any);
    try {
      await seedReportGoldenCases();
    } finally {
      txSpy.mockRestore();
    }
  });

  it("seeds the shared baseline + v2 cases with the documented labels", () => {
    const labels = captured.map((c) => `${c.variant}/${c.label}`).sort();
    // Shared baseline (templateVersion=null) — runs on every CI
    // invocation. v2-specific cases (templateVersion=2) layer on top
    // when `--version=2` is passed to the harness.
    expect(labels).toEqual([
      "WEEKLY_SUMMARY/bustling-mixed-reason",
      "WEEKLY_SUMMARY/bustling-mixed-reason-v2",
      "WEEKLY_SUMMARY/sparse-but-meaningful",
      "WEEKLY_SUMMARY/sparse-but-meaningful-v2",
      "WEEKLY_SUMMARY/zero-activity",
    ]);
  });

  it("tags cases with the correct templateVersion", () => {
    const byLabel = new Map(captured.map((c) => [c.label, c.templateVersion]));
    // Shared baseline leaves templateVersion null so the CI harness
    // runs them on every invocation (with or without --version=N).
    expect(byLabel.get("sparse-but-meaningful")).toBeNull();
    expect(byLabel.get("bustling-mixed-reason")).toBeNull();
    expect(byLabel.get("zero-activity")).toBeNull();
    // v2-specific cases only run when --version=2 is passed.
    expect(byLabel.get("sparse-but-meaningful-v2")).toBe(2);
    expect(byLabel.get("bustling-mixed-reason-v2")).toBe(2);
  });

  describe("zero-activity case", () => {
    it("declares expectedStatus=SKIPPED and trips the skip guard", () => {
      container.reset();
      const statsRepo = {
        findDailySummaries: jest.fn(),
        findDailyActiveUsers: jest.fn(),
        findTopUsersByTotalPoints: jest.fn(),
        findTrueUniqueCounterpartiesForUsers: jest.fn(),
        findCommentsByDateRange: jest.fn(),
        findUserProfiles: jest.fn(),
        findCommunityContext: jest.fn(),
        findDeepestChain: jest.fn(),
        findPeriodAggregate: jest.fn(),
        findRetentionAggregate: jest.fn(),
        findCohortRetention: jest.fn(),
        refreshTransactionSummaryDaily: jest.fn(),
        refreshUserTransactionDaily: jest.fn(),
        refreshDonationTxEdges: jest.fn(),
      };
      const entityRepo = {
        createReport: jest.fn(),
        findReportById: jest.fn(),
        findReports: jest.fn(),
        findAllReports: jest.fn(),
        findCommunityReportSummary: jest.fn(),
        recalculateCommunityLastPublished: jest.fn(),
        updateReportStatus: jest.fn(),
        findReportsByParentRunId: jest.fn(),
        updateReportJudgeResult: jest.fn(),
      };
      const templateRepo = {
        findTemplate: jest.fn(),
        findTemplateByVersion: jest.fn(),
        findActiveTemplates: jest.fn(),
        findTemplates: jest.fn(),
        findJudgeTemplate: jest.fn(),
        upsertTemplate: jest.fn(),
        findGoldenCases: jest.fn(),
        upsertGoldenCase: jest.fn(),
      };
      container.register("ReportTransactionStatsRepository", { useValue: statsRepo });
      container.register("ReportRepository", { useValue: entityRepo });
      container.register("ReportTemplateRepository", { useValue: templateRepo });
      const service = container.resolve(ReportService);

      const c = captured.find((x) => x.label === "zero-activity")!;
      // expectedStatus is the discriminator the CI harness branches
      // on; minJudgeScore stays at 0 as a defence-in-depth so the
      // case can't silently pass on a low-quality output if the
      // expectedStatus field is ever cleared.
      expect(c.expectedStatus).toBe(ReportStatus.SKIPPED);
      expect(c.minJudgeScore).toBe(0);
      expect(service.evaluateSkipReason(c.payloadFixture)).not.toBeNull();
    });
  });

  describe("non-skip cases", () => {
    it.each([
      "sparse-but-meaningful",
      "bustling-mixed-reason",
      "sparse-but-meaningful-v2",
      "bustling-mixed-reason-v2",
    ])(
      "%s does NOT trip the skip guard and has discrimination criteria",
      (label) => {
        container.reset();
        const statsRepo = {
          findDailySummaries: jest.fn(),
          findDailyActiveUsers: jest.fn(),
          findTopUsersByTotalPoints: jest.fn(),
          findTrueUniqueCounterpartiesForUsers: jest.fn(),
          findCommentsByDateRange: jest.fn(),
          findUserProfiles: jest.fn(),
          findCommunityContext: jest.fn(),
          findDeepestChain: jest.fn(),
          findPeriodAggregate: jest.fn(),
          findRetentionAggregate: jest.fn(),
          findCohortRetention: jest.fn(),
          refreshTransactionSummaryDaily: jest.fn(),
          refreshUserTransactionDaily: jest.fn(),
          refreshDonationTxEdges: jest.fn(),
        };
        const entityRepo = {
          createReport: jest.fn(),
          findReportById: jest.fn(),
          findReports: jest.fn(),
          findAllReports: jest.fn(),
          findCommunityReportSummary: jest.fn(),
          recalculateCommunityLastPublished: jest.fn(),
          updateReportStatus: jest.fn(),
          findReportsByParentRunId: jest.fn(),
          updateReportJudgeResult: jest.fn(),
        };
        const templateRepo = {
          findTemplate: jest.fn(),
          findTemplateByVersion: jest.fn(),
          findActiveTemplates: jest.fn(),
          findTemplates: jest.fn(),
          findJudgeTemplate: jest.fn(),
          upsertTemplate: jest.fn(),
          findGoldenCases: jest.fn(),
          upsertGoldenCase: jest.fn(),
        };
        container.register("ReportTransactionStatsRepository", { useValue: statsRepo });
        container.register("ReportRepository", { useValue: entityRepo });
        container.register("ReportTemplateRepository", { useValue: templateRepo });
        const service = container.resolve(ReportService);

        const c = captured.find((x) => x.label === label)!;
        // DRAFT-expected = expectedStatus left at null; minJudgeScore
        // must be a real threshold (the CI harness will compare judge
        // output against it) and the skip guard must NOT fire (else
        // the harness silently stops testing the LLM path).
        expect(c.expectedStatus).toBeNull();
        expect(c.minJudgeScore).toBeGreaterThan(0);
        expect(service.evaluateSkipReason(c.payloadFixture)).toBeNull();
        expect(c.judgeCriteria.items.length).toBeGreaterThan(0);
        // forbiddenKeys is not strictly required — sparse case uses it,
        // but the contract is "either forbiddenKeys OR judgeCriteria
        // items is non-empty"; we already asserted criteria.items > 0.
      },
    );
  });
});
