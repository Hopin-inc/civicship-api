import { Prisma } from "@prisma/client";

export const reportFeedbackSelect = Prisma.validator<Prisma.ReportFeedbackSelect>()({
  id: true,
  reportId: true,
  userId: true,
  rating: true,
  feedbackType: true,
  sectionKey: true,
  comment: true,
  createdAt: true,
});

export type PrismaReportFeedback = Prisma.ReportFeedbackGetPayload<{
  select: typeof reportFeedbackSelect;
}>;

/**
 * Per-(variant, version) aggregate row powering the `reportTemplateStats`
 * admin query. `feedbackCount` counts ReportFeedback rows joined on the
 * Report(s) that used the template. `judgeHumanCorrelation` is Pearson's
 * r across the paired (judgeScore, averageFeedbackRating) series per
 * report; null when the series is too short (< 2 reports with both
 * signals) to compute a meaningful correlation.
 */
export interface ReportTemplateStatsRow {
  variant: string;
  version: number;
  avgRating: number | null;
  feedbackCount: number;
  avgJudgeScore: number | null;
  judgeHumanCorrelation: number | null;
}
