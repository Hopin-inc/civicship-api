import { Prisma } from "@prisma/client";
import { injectable } from "tsyringe";
import { IContext } from "@/types/server";
import {
  CreateReportFeedbackInput,
  IReportFeedbackRepository,
  JudgeFeedbackPairRow,
} from "@/application/domain/report/feedback/data/interface";
import {
  PrismaReportFeedback,
  reportFeedbackSelect,
} from "@/application/domain/report/feedback/data/type";

@injectable()
export default class ReportFeedbackRepository implements IReportFeedbackRepository {
  async createFeedback(
    ctx: IContext,
    data: CreateReportFeedbackInput,
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaReportFeedback> {
    const doCreate = (client: Prisma.TransactionClient) =>
      client.reportFeedback.create({
        data: {
          reportId: data.reportId,
          userId: data.userId,
          rating: data.rating,
          feedbackType: data.feedbackType ?? null,
          sectionKey: data.sectionKey ?? null,
          comment: data.comment ?? null,
        },
        select: reportFeedbackSelect,
      });

    if (tx) return doCreate(tx);
    return ctx.issuer.public(ctx, doCreate);
  }

  async findFeedbackByReportAndUser(
    ctx: IContext,
    reportId: string,
    userId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaReportFeedback | null> {
    const doFind = (client: Prisma.TransactionClient) =>
      client.reportFeedback.findUnique({
        where: { reportId_userId: { reportId, userId } },
        select: reportFeedbackSelect,
      });

    if (tx) return doFind(tx);
    return ctx.issuer.public(ctx, doFind);
  }

  async findFeedbacksByReport(
    ctx: IContext,
    reportId: string,
    params: { first: number; cursor?: string | null },
  ): Promise<{ items: PrismaReportFeedback[]; totalCount: number }> {
    return ctx.issuer.public(ctx, async (tx) => {
      const [items, totalCount] = await Promise.all([
        tx.reportFeedback.findMany({
          where: { reportId },
          select: reportFeedbackSelect,
          orderBy: { createdAt: "desc" },
          take: params.first + 1,
          ...(params.cursor ? { skip: 1, cursor: { id: params.cursor } } : {}),
        }),
        tx.reportFeedback.count({ where: { reportId } }),
      ]);
      return { items, totalCount };
    });
  }

  async findFeedbacksByReportIds(
    ctx: IContext,
    reportIds: string[],
  ): Promise<PrismaReportFeedback[]> {
    if (reportIds.length === 0) return [];
    return ctx.issuer.public(ctx, (tx) =>
      tx.reportFeedback.findMany({
        where: { reportId: { in: reportIds } },
        select: reportFeedbackSelect,
        orderBy: { createdAt: "desc" },
      }),
    );
  }

  /**
   * Aggregate feedback stats for templates matching (variant, version?).
   * When `version` is omitted, the query rolls up across every version of
   * that variant — useful for a "how is WEEKLY_SUMMARY doing overall?"
   * snapshot. When present, it scopes tightly to a single prompt revision.
   *
   * The three-way roll-up is run as two round trips:
   *   1. `avgRating` / `feedbackCount` / `avgJudgeScore` via Prisma
   *      aggregates on the related Reports.
   *   2. Per-report (judgeScore, avgRating) pairs via a grouped raw query
   *      so the service can compute Pearson's r on the paired series.
   *
   * The `version` in the return reflects the value passed in — the caller
   * passes the exact revision they want displayed, and the stats row
   * mirrors that back so consumers need not re-derive it.
   */
  async getTemplateFeedbackAggregates(
    ctx: IContext,
    variant: string,
    version?: number,
  ): Promise<{
    feedbackCount: number;
    avgRating: number | null;
    avgJudgeScore: number | null;
    pairs: JudgeFeedbackPairRow[];
    version: number;
  }> {
    return ctx.issuer.public(ctx, async (tx) => {
      // Report → Template join: template.variant matches, and if `version`
      // was specified, template.version matches too.
      const reportWhere: Prisma.ReportWhereInput = {
        template: {
          variant,
          ...(version !== undefined ? { version } : {}),
        },
      };

      const [feedbackAgg, judgeAgg] = await Promise.all([
        tx.reportFeedback.aggregate({
          where: { report: reportWhere },
          _avg: { rating: true },
          _count: { _all: true },
        }),
        tx.report.aggregate({
          where: { ...reportWhere, judgeScore: { not: null } },
          _avg: { judgeScore: true },
        }),
      ]);

      const pairRows = await tx.$queryRaw<
        { report_id: string; judge_score: number; avg_rating: number }[]
      >`
        SELECT
          r."id" AS "report_id",
          r."judge_score"::float AS "judge_score",
          AVG(f."rating")::float AS "avg_rating"
        FROM "t_reports" r
        INNER JOIN "t_report_templates" t ON t."id" = r."template_id"
        INNER JOIN "t_report_feedbacks" f ON f."report_id" = r."id"
        WHERE t."variant" = ${variant}
          ${version !== undefined ? Prisma.sql`AND t."version" = ${version}` : Prisma.empty}
          AND r."judge_score" IS NOT NULL
        GROUP BY r."id", r."judge_score"
      `;

      const pairs: JudgeFeedbackPairRow[] = pairRows.map((p) => ({
        reportId: p.report_id,
        judgeScore: Number(p.judge_score),
        avgRating: Number(p.avg_rating),
      }));

      return {
        feedbackCount: feedbackAgg._count._all,
        avgRating: feedbackAgg._avg.rating ?? null,
        avgJudgeScore: judgeAgg._avg.judgeScore ?? null,
        pairs,
        // When `version` is provided we echo it back. When omitted the
        // row represents a roll-up across every version — encode that as
        // `0` in the response rather than leaving the field null, so the
        // GraphQL schema can keep `version: Int!` non-nullable. Callers
        // passing `version` always get the exact value they asked for.
        version: version ?? 0,
      };
    });
  }
}
