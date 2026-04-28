import { Prisma, ReportTemplateScope, ReportTemplateKind } from "@prisma/client";

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

/**
 * Paired (judgeScore, avgFeedbackRating) rows used by the service to
 * compute Pearson's r between the two series. A report is eligible to
 * appear here only when both signals exist — reports with no feedback are
 * skipped upstream rather than contributing a 0 that would bias the
 * correlation.
 *
 * Lives in `data/type.ts` rather than `data/interface.ts` so the
 * breakdown row type defined below — which embeds the pairs in its
 * own shape — can reference it without forcing `interface.ts` to
 * `data/type.ts` and back.
 */
export interface JudgeFeedbackPairRow {
  reportId: string;
  judgeScore: number;
  avgRating: number;
}

/**
 * Per-template breakdown row for the A/B comparison screen. Each row
 * = one prompt revision (one ReportTemplate row), so v1 / v2 / v3
 * surface independently. `pairs` carries the per-Report (judgeScore,
 * avgRating) observations the service runs Pearson's r over for
 * `judgeHumanCorrelation`. Templates with no Reports / no feedback
 * still appear here (LEFT JOIN-driven) with `feedbackCount: 0`.
 */
export interface TemplateBreakdownRow {
  templateId: string;
  version: number;
  scope: ReportTemplateScope;
  kind: ReportTemplateKind;
  experimentKey: string | null;
  isActive: boolean;
  isEnabled: boolean;
  trafficWeight: number;
  feedbackCount: number;
  avgRating: number | null;
  avgJudgeScore: number | null;
  pairs: JudgeFeedbackPairRow[];
}

/**
 * Repository-level row for `adminTemplateFeedbackStats`. `buckets` is
 * sparse (zero-count ratings omitted) — the presenter pads it to a
 * dense 1..5 shape before crossing the GraphQL boundary so the wire
 * format matches the documented "always five entries" contract. Keeping
 * the dense fill in the presenter rather than the SQL keeps the raw
 * aggregate cheap (`COUNT(*) GROUP BY rating` returns at most five
 * rows; padding with the schema-driven enum at the edge is trivial).
 */
export interface AdminTemplateFeedbackStatsRow {
  totalCount: number;
  avgRating: number | null;
  buckets: Array<{ rating: number; count: number }>;
}
