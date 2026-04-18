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
 * report; null when the series is too short (< 3 reports with both
 * signals) to compute a meaningful correlation — two points always
 * produce ±1 under the classical formula and carry no signal.
 *
 * `version` is null when the caller did not pin the query to a specific
 * template revision — the row then represents a roll-up across every
 * version of the variant.
 */
export interface ReportTemplateStatsRow {
  variant: string;
  version: number | null;
  avgRating: number | null;
  feedbackCount: number;
  avgJudgeScore: number | null;
  judgeHumanCorrelation: number | null;
}
