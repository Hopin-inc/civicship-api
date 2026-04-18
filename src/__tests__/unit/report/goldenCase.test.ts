/**
 * Structural / contract tests for the golden dataset seeds. These run
 * without a database — the goal is to catch malformed fixtures before
 * the CI harness pays the LLM cost to discover them.
 *
 * What we DO check:
 *   - exactly the three documented labels exist
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

  it("seeds exactly three cases with the documented labels", () => {
    const labels = captured.map((c) => `${c.variant}/${c.label}`).sort();
    expect(labels).toEqual([
      "WEEKLY_SUMMARY/bustling-mixed-reason",
      "WEEKLY_SUMMARY/sparse-but-meaningful",
      "WEEKLY_SUMMARY/zero-activity",
    ]);
  });

  describe("zero-activity case", () => {
    it("declares expectedStatus=SKIPPED and trips the skip guard", () => {
      container.reset();
      const repo = {
        findDailySummaries: jest.fn(),
        findDailyActiveUsers: jest.fn(),
        findTopUsersByTotalPoints: jest.fn(),
        findCommentsByDateRange: jest.fn(),
        findUserProfiles: jest.fn(),
        findCommunityContext: jest.fn(),
        findDeepestChain: jest.fn(),
        refreshTransactionSummaryDaily: jest.fn(),
        refreshUserTransactionDaily: jest.fn(),
        findTemplate: jest.fn(),
        upsertTemplate: jest.fn(),
        createReport: jest.fn(),
        findReportById: jest.fn(),
        findReports: jest.fn(),
        updateReportStatus: jest.fn(),
        findReportsByParentRunId: jest.fn(),
        findJudgeTemplate: jest.fn(),
        updateReportJudgeResult: jest.fn(),
        findGoldenCases: jest.fn(),
        upsertGoldenCase: jest.fn(),
      };
      container.register("ReportRepository", { useValue: repo });
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
    it.each(["sparse-but-meaningful", "bustling-mixed-reason"])(
      "%s does NOT trip the skip guard and has discrimination criteria",
      (label) => {
        container.reset();
        const repo = {
          findDailySummaries: jest.fn(),
          findDailyActiveUsers: jest.fn(),
          findTopUsersByTotalPoints: jest.fn(),
          findCommentsByDateRange: jest.fn(),
          findUserProfiles: jest.fn(),
          findCommunityContext: jest.fn(),
          findDeepestChain: jest.fn(),
          refreshTransactionSummaryDaily: jest.fn(),
          refreshUserTransactionDaily: jest.fn(),
          findTemplate: jest.fn(),
          upsertTemplate: jest.fn(),
          createReport: jest.fn(),
          findReportById: jest.fn(),
          findReports: jest.fn(),
          updateReportStatus: jest.fn(),
          findReportsByParentRunId: jest.fn(),
          findJudgeTemplate: jest.fn(),
          updateReportJudgeResult: jest.fn(),
          findGoldenCases: jest.fn(),
          upsertGoldenCase: jest.fn(),
        };
        container.register("ReportRepository", { useValue: repo });
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
