import { Prisma, FeedbackType } from "@prisma/client";
import { IContext } from "@/types/server";
import { PrismaReportFeedback } from "@/application/domain/report/feedback/data/type";

export interface CreateReportFeedbackInput {
  reportId: string;
  userId: string;
  rating: number;
  feedbackType?: FeedbackType | null;
  sectionKey?: string | null;
  comment?: string | null;
}

/**
 * Paired (judgeScore, avgFeedbackRating) rows used by the service to
 * compute Pearson's r between the two series. A report is eligible to
 * appear here only when both signals exist — reports with no feedback are
 * skipped upstream rather than contributing a 0 that would bias the
 * correlation.
 */
export interface JudgeFeedbackPairRow {
  reportId: string;
  judgeScore: number;
  avgRating: number;
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
}
