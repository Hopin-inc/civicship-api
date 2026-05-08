import "reflect-metadata";
import { container } from "tsyringe";
import { ReportTemplateKind, ReportTemplateScope } from "@prisma/client";
import ReportFeedbackService from "@/application/domain/report/feedback/service";
import {
  pearsonCorrelation,
  JUDGE_HUMAN_CORRELATION_WARNING_THRESHOLD,
} from "@/application/domain/report/feedback/correlation";
import type { IContext } from "@/types/server";

describe("ReportFeedbackService.getTemplateStats", () => {
  const fakeCtx = {} as IContext;

  let repository: {
    createFeedback: jest.Mock;
    findFeedbackByReportAndUser: jest.Mock;
    findFeedbacksByReport: jest.Mock;
    findFeedbacksByReportIds: jest.Mock;
    getTemplateFeedbackAggregates: jest.Mock;
    getTemplateBreakdown: jest.Mock;
  };
  let service: ReportFeedbackService;

  beforeEach(() => {
    container.reset();
    repository = {
      createFeedback: jest.fn(),
      findFeedbackByReportAndUser: jest.fn(),
      findFeedbacksByReport: jest.fn(),
      findFeedbacksByReportIds: jest.fn(),
      getTemplateFeedbackAggregates: jest.fn(),
      getTemplateBreakdown: jest.fn(),
    };
    container.register("ReportFeedbackRepository", { useValue: repository });
    service = container.resolve(ReportFeedbackService);
  });

  it("returns null correlation + no warning when there is no feedback", async () => {
    repository.getTemplateFeedbackAggregates.mockResolvedValue({
      feedbackCount: 0,
      avgRating: null,
      avgJudgeScore: null,
      pairs: [],
      version: 1,
    });

    const result = await service.getTemplateStats(fakeCtx, "WEEKLY_SUMMARY", 1);
    expect(result.avgRating).toBeNull();
    expect(result.feedbackCount).toBe(0);
    expect(result.judgeHumanCorrelation).toBeNull();
    expect(result.correlationWarning).toBe(false);
  });

  it("computes Pearson's r when judge + rating pairs exist", async () => {
    // Perfectly correlated series (judgeScore rises linearly with rating)
    // → r = 1, safely above the 0.7 warning threshold.
    repository.getTemplateFeedbackAggregates.mockResolvedValue({
      feedbackCount: 5,
      avgRating: 3.0,
      avgJudgeScore: 75,
      pairs: [
        { reportId: "r1", judgeScore: 60, avgRating: 2 },
        { reportId: "r2", judgeScore: 70, avgRating: 3 },
        { reportId: "r3", judgeScore: 80, avgRating: 4 },
        { reportId: "r4", judgeScore: 90, avgRating: 5 },
      ],
      version: 1,
    });

    const result = await service.getTemplateStats(fakeCtx, "WEEKLY_SUMMARY", 1);
    expect(result.judgeHumanCorrelation).not.toBeNull();
    expect(result.judgeHumanCorrelation!).toBeGreaterThan(0.99);
    expect(result.correlationWarning).toBe(false);
  });

  it("flags correlationWarning when r falls below the threshold", async () => {
    // Anti-correlated series (higher judgeScore ↔ lower rating) → r ≈ -1,
    // well below 0.7.
    repository.getTemplateFeedbackAggregates.mockResolvedValue({
      feedbackCount: 4,
      avgRating: 3.5,
      avgJudgeScore: 75,
      pairs: [
        { reportId: "r1", judgeScore: 90, avgRating: 2 },
        { reportId: "r2", judgeScore: 80, avgRating: 3 },
        { reportId: "r3", judgeScore: 70, avgRating: 4 },
        { reportId: "r4", judgeScore: 60, avgRating: 5 },
      ],
      version: 1,
    });

    const result = await service.getTemplateStats(fakeCtx, "WEEKLY_SUMMARY", 1);
    expect(result.judgeHumanCorrelation).toBeLessThan(
      JUDGE_HUMAN_CORRELATION_WARNING_THRESHOLD,
    );
    expect(result.correlationWarning).toBe(true);
  });
});

describe("ReportFeedbackService.getTemplateBreakdown", () => {
  const fakeCtx = {} as IContext;

  let repository: {
    createFeedback: jest.Mock;
    findFeedbackByReportAndUser: jest.Mock;
    findFeedbacksByReport: jest.Mock;
    findFeedbacksByReportIds: jest.Mock;
    getTemplateFeedbackAggregates: jest.Mock;
    getTemplateBreakdown: jest.Mock;
  };
  let service: ReportFeedbackService;

  // Compact factory keeps the test rows readable while satisfying the
  // full TemplateBreakdownRow shape — the breakdown service runs
  // Pearson over the embedded `pairs` array, so non-pair fields just
  // need to round-trip unchanged.
  const row = (overrides: {
    templateId: string;
    pairs?: Array<{ reportId: string; judgeScore: number; avgRating: number }>;
    feedbackCount?: number;
    version?: number;
  }) => ({
    templateId: overrides.templateId,
    version: overrides.version ?? 1,
    scope: ReportTemplateScope.SYSTEM,
    kind: ReportTemplateKind.GENERATION,
    experimentKey: null,
    isActive: true,
    isEnabled: true,
    trafficWeight: 100,
    feedbackCount: overrides.feedbackCount ?? overrides.pairs?.length ?? 0,
    avgRating: null,
    avgJudgeScore: null,
    pairs: overrides.pairs ?? [],
  });

  beforeEach(() => {
    container.reset();
    repository = {
      createFeedback: jest.fn(),
      findFeedbackByReportAndUser: jest.fn(),
      findFeedbacksByReport: jest.fn(),
      findFeedbacksByReportIds: jest.fn(),
      getTemplateFeedbackAggregates: jest.fn(),
      getTemplateBreakdown: jest.fn(),
    };
    container.register("ReportFeedbackRepository", { useValue: repository });
    service = container.resolve(ReportFeedbackService);
  });

  it("computes per-template Pearson independently across rows", async () => {
    repository.getTemplateBreakdown.mockResolvedValue({
      items: [
        // Strong positive correlation → r ≈ 1, no warning.
        row({
          templateId: "tmpl-v1",
          pairs: [
            { reportId: "r1", judgeScore: 60, avgRating: 2 },
            { reportId: "r2", judgeScore: 75, avgRating: 3.5 },
            { reportId: "r3", judgeScore: 90, avgRating: 5 },
          ],
        }),
        // Anti-correlation → r ≈ -1, warning ON.
        row({
          templateId: "tmpl-v2",
          pairs: [
            { reportId: "r4", judgeScore: 90, avgRating: 1 },
            { reportId: "r5", judgeScore: 70, avgRating: 3 },
            { reportId: "r6", judgeScore: 50, avgRating: 5 },
          ],
        }),
      ],
      totalCount: 2,
    });

    const result = await service.getTemplateBreakdown(fakeCtx, {
      variant: "WEEKLY_SUMMARY",
      kind: ReportTemplateKind.GENERATION,
      includeInactive: false,
      first: 20,
    });

    expect(result.items).toHaveLength(2);
    expect(result.items[0].templateId).toBe("tmpl-v1");
    expect(result.items[0].judgeHumanCorrelation).not.toBeNull();
    expect(result.items[0].judgeHumanCorrelation!).toBeGreaterThan(0.99);
    expect(result.items[0].correlationWarning).toBe(false);

    expect(result.items[1].templateId).toBe("tmpl-v2");
    expect(result.items[1].judgeHumanCorrelation).not.toBeNull();
    expect(result.items[1].correlationWarning).toBe(true);
  });

  it("returns null correlation when a row has fewer than 3 pairs", async () => {
    repository.getTemplateBreakdown.mockResolvedValue({
      items: [
        row({
          templateId: "tmpl-thin",
          pairs: [
            { reportId: "r1", judgeScore: 60, avgRating: 3 },
            { reportId: "r2", judgeScore: 80, avgRating: 4 },
          ],
        }),
      ],
      totalCount: 1,
    });

    const result = await service.getTemplateBreakdown(fakeCtx, {
      variant: "WEEKLY_SUMMARY",
      kind: ReportTemplateKind.GENERATION,
      includeInactive: false,
      first: 20,
    });

    expect(result.items[0].judgeHumanCorrelation).toBeNull();
    expect(result.items[0].correlationWarning).toBe(false);
  });

  it("forwards pagination params to the repository unchanged", async () => {
    repository.getTemplateBreakdown.mockResolvedValue({ items: [], totalCount: 0 });

    await service.getTemplateBreakdown(fakeCtx, {
      variant: "WEEKLY_SUMMARY",
      version: 3,
      kind: ReportTemplateKind.JUDGE,
      includeInactive: true,
      cursor: "tmpl-cursor",
      first: 50,
    });

    expect(repository.getTemplateBreakdown).toHaveBeenCalledWith(fakeCtx, {
      variant: "WEEKLY_SUMMARY",
      version: 3,
      kind: ReportTemplateKind.JUDGE,
      includeInactive: true,
      cursor: "tmpl-cursor",
      first: 50,
    });
  });
});

describe("ReportFeedbackService.listAdminTemplateFeedbacks", () => {
  const fakeCtx = {} as IContext;

  let repository: {
    createFeedback: jest.Mock;
    findFeedbackByReportAndUser: jest.Mock;
    findFeedbacksByReport: jest.Mock;
    findFeedbacksByReportIds: jest.Mock;
    getTemplateFeedbackAggregates: jest.Mock;
    getTemplateBreakdown: jest.Mock;
    findAdminTemplateFeedbacks: jest.Mock;
  };
  let service: ReportFeedbackService;

  beforeEach(() => {
    container.reset();
    repository = {
      createFeedback: jest.fn(),
      findFeedbackByReportAndUser: jest.fn(),
      findFeedbacksByReport: jest.fn(),
      findFeedbacksByReportIds: jest.fn(),
      getTemplateFeedbackAggregates: jest.fn(),
      getTemplateBreakdown: jest.fn(),
      findAdminTemplateFeedbacks: jest
        .fn()
        .mockResolvedValue({ items: [], totalCount: 0 }),
    };
    container.register("ReportFeedbackRepository", { useValue: repository });
    service = container.resolve(ReportFeedbackService);
  });

  it("forwards every filter to the repository unchanged", async () => {
    // The service is a pure pass-through on this path — no Pearson, no
    // threshold math. The test pins the contract so a future refactor
    // cannot silently drop a filter the UI depends on.
    await service.listAdminTemplateFeedbacks(fakeCtx, {
      variant: "WEEKLY_SUMMARY",
      version: 3,
      kind: ReportTemplateKind.JUDGE,
      feedbackType: "ACCURACY" as never,
      maxRating: 2,
      cursor: "feedback-cursor",
      first: 25,
    });

    expect(repository.findAdminTemplateFeedbacks).toHaveBeenCalledWith(fakeCtx, {
      variant: "WEEKLY_SUMMARY",
      version: 3,
      kind: ReportTemplateKind.JUDGE,
      feedbackType: "ACCURACY",
      maxRating: 2,
      cursor: "feedback-cursor",
      first: 25,
    });
  });

  it("returns the repository's items + totalCount unchanged", async () => {
    repository.findAdminTemplateFeedbacks.mockResolvedValue({
      items: [{ id: "feedback-1" }, { id: "feedback-2" }],
      totalCount: 2,
    });

    const result = await service.listAdminTemplateFeedbacks(fakeCtx, {
      variant: "WEEKLY_SUMMARY",
      kind: ReportTemplateKind.GENERATION,
      first: 20,
    });
    expect(result.items).toHaveLength(2);
    expect(result.totalCount).toBe(2);
  });
});

describe("pearsonCorrelation", () => {
  it("returns null when the pair count is below the minimum", () => {
    expect(pearsonCorrelation([])).toBeNull();
    expect(pearsonCorrelation([{ reportId: "r1", judgeScore: 70, avgRating: 3 }])).toBeNull();
    expect(
      pearsonCorrelation([
        { reportId: "r1", judgeScore: 70, avgRating: 3 },
        { reportId: "r2", judgeScore: 80, avgRating: 4 },
      ]),
    ).toBeNull();
  });

  it("returns null when either series has zero variance", () => {
    // All judgeScores identical → denX = 0 → division-by-zero → null.
    const result = pearsonCorrelation([
      { reportId: "r1", judgeScore: 70, avgRating: 2 },
      { reportId: "r2", judgeScore: 70, avgRating: 4 },
      { reportId: "r3", judgeScore: 70, avgRating: 3 },
    ]);
    expect(result).toBeNull();
  });

  it("returns a value between -1 and 1 (inclusive)", () => {
    const r = pearsonCorrelation([
      { reportId: "r1", judgeScore: 50, avgRating: 2 },
      { reportId: "r2", judgeScore: 75, avgRating: 3 },
      { reportId: "r3", judgeScore: 100, avgRating: 5 },
    ]);
    expect(r).not.toBeNull();
    expect(r!).toBeGreaterThanOrEqual(-1);
    expect(r!).toBeLessThanOrEqual(1);
  });
});

describe("ReportFeedbackService.getAdminTemplateFeedbackStats", () => {
  const fakeCtx = {} as IContext;

  let repository: {
    createFeedback: jest.Mock;
    findFeedbackByReportAndUser: jest.Mock;
    findFeedbacksByReport: jest.Mock;
    findFeedbacksByReportIds: jest.Mock;
    getTemplateFeedbackAggregates: jest.Mock;
    getTemplateBreakdown: jest.Mock;
    findAdminTemplateFeedbacks: jest.Mock;
    getAdminTemplateFeedbackStats: jest.Mock;
  };
  let service: ReportFeedbackService;

  beforeEach(() => {
    container.reset();
    repository = {
      createFeedback: jest.fn(),
      findFeedbackByReportAndUser: jest.fn(),
      findFeedbacksByReport: jest.fn(),
      findFeedbacksByReportIds: jest.fn(),
      getTemplateFeedbackAggregates: jest.fn(),
      getTemplateBreakdown: jest.fn(),
      findAdminTemplateFeedbacks: jest.fn(),
      getAdminTemplateFeedbackStats: jest
        .fn()
        .mockResolvedValue({ totalCount: 0, avgRating: null, buckets: [] }),
    };
    container.register("ReportFeedbackRepository", { useValue: repository });
    service = container.resolve(ReportFeedbackService);
  });

  it("forwards variant / version / kind to the repository unchanged", async () => {
    // Pure pass-through path — the densification / Pearson math
    // happens in the presenter, not here. Pin the contract so a
    // future refactor cannot silently drop one of the three filter
    // dimensions.
    await service.getAdminTemplateFeedbackStats(fakeCtx, {
      variant: "WEEKLY_SUMMARY",
      version: 4,
      kind: ReportTemplateKind.JUDGE,
    });

    expect(repository.getAdminTemplateFeedbackStats).toHaveBeenCalledWith(fakeCtx, {
      variant: "WEEKLY_SUMMARY",
      version: 4,
      kind: ReportTemplateKind.JUDGE,
    });
  });

  it("returns the repository row unchanged (no derived math at this layer)", async () => {
    repository.getAdminTemplateFeedbackStats.mockResolvedValue({
      totalCount: 3,
      avgRating: 4.0,
      buckets: [
        { rating: 3, count: 1 },
        { rating: 5, count: 2 },
      ],
    });

    const result = await service.getAdminTemplateFeedbackStats(fakeCtx, {
      variant: "WEEKLY_SUMMARY",
      kind: ReportTemplateKind.GENERATION,
    });
    expect(result.totalCount).toBe(3);
    expect(result.avgRating).toBe(4.0);
    expect(result.buckets).toHaveLength(2);
  });
});
