import "reflect-metadata";
import { container } from "tsyringe";
import ReportFeedbackService, {
  pearsonCorrelation,
  JUDGE_HUMAN_CORRELATION_WARNING_THRESHOLD,
} from "@/application/domain/report/feedback/service";
import type { IContext } from "@/types/server";

describe("ReportFeedbackService.getTemplateStats", () => {
  const fakeCtx = {} as IContext;

  let repository: {
    createFeedback: jest.Mock;
    findFeedbackByReportAndUser: jest.Mock;
    findFeedbacksByReport: jest.Mock;
    findFeedbacksByReportIds: jest.Mock;
    getTemplateFeedbackAggregates: jest.Mock;
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
