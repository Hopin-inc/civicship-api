import { Prisma, FeedbackType, ReportTemplateKind } from "@prisma/client";
import { IContext } from "@/types/server";
import {
  PrismaReportFeedback,
  TemplateBreakdownRow,
  JudgeFeedbackPairRow,
} from "@/application/domain/report/feedback/data/type";

export { JudgeFeedbackPairRow };

export interface CreateReportFeedbackInput {
  reportId: string;
  userId: string;
  rating: number;
  feedbackType?: FeedbackType | null;
  sectionKey?: string | null;
  comment?: string | null;
}

export interface IReportFeedbackRepository {
  createFeedback(
    ctx: IContext,
    data: CreateReportFeedbackInput,
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaReportFeedback>;

  findFeedbackByReportAndUser(
    ctx: IContext,
    reportId: string,
    userId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaReportFeedback | null>;

  findFeedbacksByReport(
    ctx: IContext,
    reportId: string,
    params: { first: number; cursor?: string | null },
  ): Promise<{ items: PrismaReportFeedback[]; totalCount: number }>;

  findFeedbacksByReportIds(
    ctx: IContext,
    reportIds: string[],
  ): Promise<PrismaReportFeedback[]>;

  /**
   * Aggregate feedback across reports that used a given (variant, version).
   * Returns feedbackCount / avgRating at the (variant, version) level, and
   * the full (judgeScore, avgRating) pair set so the service can compute
   * correlation in-process (Postgres' `corr()` is not wired to Prisma
   * `$queryRaw` types as cleanly as the plain aggregate). `version` in the
   * return is the caller's argument echoed back, or null when the caller
   * requested a roll-up across every version.
   */
  getTemplateFeedbackAggregates(
    ctx: IContext,
    variant: string,
    version?: number,
  ): Promise<{
    feedbackCount: number;
    avgRating: number | null;
    avgJudgeScore: number | null;
    pairs: JudgeFeedbackPairRow[];
    version: number | null;
  }>;

  /**
   * Per-template breakdown for the A/B comparison screen
   * (`reportTemplateStatsBreakdown`). Each row pairs a template's
   * config snapshot (version / scope / kind / experimentKey / state)
   * with feedbackCount / avgRating / avgJudgeScore aggregated over
   * the Reports that used it, plus the per-template (judgeScore,
   * avgRating) pair set the service runs Pearson's r over.
   *
   * Implementation must use a LEFT JOIN from `t_report_templates` so
   * a template with zero feedback still surfaces (the UI displays
   * `—` for the metrics rather than omitting the row). Pagination
   * is `id ASC` based for cursor stability — the breakdown rows are
   * O(versions × experimentKeys) per variant, which can reach the
   * hundreds for variants with active experimentation.
   */
  getTemplateBreakdown(
    ctx: IContext,
    params: {
      variant: string;
      version?: number;
      kind: ReportTemplateKind;
      includeInactive: boolean;
      cursor?: string;
      first: number;
    },
  ): Promise<{ items: TemplateBreakdownRow[]; totalCount: number }>;

  /**
   * Phase 1.5 admin: review-style list of individual feedbacks scoped
   * to a template (variant + optional version, plus `kind` so JUDGE
   * and GENERATION prompts have separate review streams). The
   * `feedbackType` / `maxRating` filters drive the "drill into low
   * ratings on a specific quality axis" workflow.
   *
   * Ordering is `(createdAt DESC, id DESC)` so newest reviews lead
   * the page and cursor pagination is total-ordered (without `id` as
   * tiebreaker, two rows sharing a `createdAt` — possible under bulk
   * seed inserts or high-concurrency writes — could reshuffle between
   * pages and either duplicate or skip across cursor boundaries). The
   * cursor is a feedback `id`.
   */
  findAdminTemplateFeedbacks(
    ctx: IContext,
    params: {
      variant: string;
      version?: number;
      kind: ReportTemplateKind;
      feedbackType?: FeedbackType;
      maxRating?: number;
      cursor?: string;
      first: number;
    },
  ): Promise<{ items: PrismaReportFeedback[]; totalCount: number }>;
}
