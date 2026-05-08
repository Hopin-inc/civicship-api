import { FeedbackType, Prisma, ReportTemplateKind } from "@prisma/client";
import { inject, injectable } from "tsyringe";
import { IContext } from "@/types/server";
import {
  CreateReportFeedbackInput,
  IReportFeedbackRepository,
} from "@/application/domain/report/feedback/data/interface";
import {
  PrismaReportFeedback,
  ReportTemplateStatsRow,
  TemplateBreakdownRow,
  AdminTemplateFeedbackStatsRow,
} from "@/application/domain/report/feedback/data/type";
import {
  JUDGE_HUMAN_CORRELATION_WARNING_THRESHOLD,
  pearsonCorrelation,
} from "@/application/domain/report/feedback/correlation";

@injectable()
export default class ReportFeedbackService {
  constructor(
    @inject("ReportFeedbackRepository") private readonly repository: IReportFeedbackRepository,
  ) {}

  async createFeedback(
    ctx: IContext,
    data: CreateReportFeedbackInput,
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaReportFeedback> {
    return this.repository.createFeedback(ctx, data, tx);
  }

  async getExistingFeedback(
    ctx: IContext,
    reportId: string,
    userId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaReportFeedback | null> {
    return this.repository.findFeedbackByReportAndUser(ctx, reportId, userId, tx);
  }

  async listFeedbacksByReport(
    ctx: IContext,
    reportId: string,
    params: { first: number; cursor?: string | null },
  ): Promise<{ items: PrismaReportFeedback[]; totalCount: number }> {
    return this.repository.findFeedbacksByReport(ctx, reportId, params);
  }

  async listFeedbacksByReportIds(
    ctx: IContext,
    reportIds: string[],
  ): Promise<PrismaReportFeedback[]> {
    return this.repository.findFeedbacksByReportIds(ctx, reportIds);
  }

  /**
   * Assemble the stats row for `reportTemplateStats`:
   *   - Forward the aggregates straight from the repository.
   *   - Compute Pearson's r over the paired (judgeScore, avgRating) series.
   *   - Return `correlationWarning=true` iff we have a correlation and it
   *     sits below the recalibration threshold.
   */
  async getTemplateStats(
    ctx: IContext,
    variant: string,
    version?: number,
  ): Promise<ReportTemplateStatsRow & { correlationWarning: boolean }> {
    const agg = await this.repository.getTemplateFeedbackAggregates(ctx, variant, version);
    const correlation = pearsonCorrelation(agg.pairs);
    const correlationWarning =
      correlation !== null && correlation < JUDGE_HUMAN_CORRELATION_WARNING_THRESHOLD;

    return {
      variant,
      // `agg.version` is null iff the caller did not pin to a revision —
      // mirror that through to the GraphQL layer where the field is
      // nullable to encode "roll-up across all versions".
      version: agg.version,
      avgRating: agg.avgRating,
      feedbackCount: agg.feedbackCount,
      avgJudgeScore: agg.avgJudgeScore,
      judgeHumanCorrelation: correlation,
      correlationWarning,
    };
  }

  /**
   * Per-template breakdown for the A/B comparison admin screen
   * (`reportTemplateStatsBreakdown`). Wraps the repository's grouped
   * fetch with the same Pearson + warning-threshold logic the
   * single-row stats path uses, so both screens compute correlation
   * the same way (3-pair minimum, 0.7 threshold) — admins get
   * comparable signals across the aggregate KPI and the breakdown.
   */
  async getTemplateBreakdown(
    ctx: IContext,
    params: {
      variant: string;
      version?: number;
      kind: ReportTemplateKind;
      includeInactive: boolean;
      cursor?: string;
      first: number;
    },
  ): Promise<{
    items: Array<TemplateBreakdownRow & {
      judgeHumanCorrelation: number | null;
      correlationWarning: boolean;
    }>;
    totalCount: number;
  }> {
    const result = await this.repository.getTemplateBreakdown(ctx, params);
    return {
      items: result.items.map((row) => {
        const correlation = pearsonCorrelation(row.pairs);
        const correlationWarning =
          correlation !== null && correlation < JUDGE_HUMAN_CORRELATION_WARNING_THRESHOLD;
        return { ...row, judgeHumanCorrelation: correlation, correlationWarning };
      }),
      totalCount: result.totalCount,
    };
  }

  /**
   * Phase 1.5 admin: review-style individual feedback list scoped to
   * a template. Pure pass-through to the repository — no Pearson /
   * threshold math on this path because the screen renders raw
   * comments, not derived correlations.
   */
  async listAdminTemplateFeedbacks(
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
  ): Promise<{ items: PrismaReportFeedback[]; totalCount: number }> {
    return this.repository.findAdminTemplateFeedbacks(ctx, params);
  }

  /**
   * Phase 1.5 admin: population stats for a template's feedback set.
   * Pure pass-through to the repository — no derived math at this
   * layer (the SQL already returns total / mean / buckets in one
   * pass). The presenter handles the dense 1..5 bucket fill.
   */
  async getAdminTemplateFeedbackStats(
    ctx: IContext,
    params: { variant: string; version?: number; kind: ReportTemplateKind },
  ): Promise<AdminTemplateFeedbackStatsRow> {
    return this.repository.getAdminTemplateFeedbackStats(ctx, params);
  }
}

