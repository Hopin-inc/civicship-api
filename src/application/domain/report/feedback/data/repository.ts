import { Prisma, ReportTemplateKind, ReportTemplateScope } from "@prisma/client";
import { injectable } from "tsyringe";
import { IContext } from "@/types/server";
import {
  CreateReportFeedbackInput,
  IReportFeedbackRepository,
} from "@/application/domain/report/feedback/data/interface";
import {
  PrismaReportFeedback,
  reportFeedbackSelect,
  JudgeFeedbackPairRow,
  TemplateBreakdownRow,
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
          // `id` as a secondary key turns the ordering into a total order —
          // without it, two rows sharing a `createdAt` (possible when a
          // seed script bulk-inserts, or under high write concurrency)
          // can reshuffle between pages and either duplicate or skip
          // rows across cursor boundaries.
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
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
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
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
    version: number | null;
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

      // INNER JOIN on `t_report_feedbacks` is deliberate: Pearson's r
      // requires *paired* observations, so a report with a `judgeScore`
      // but no human feedback contributes no signal and must be
      // dropped. Using LEFT JOIN and coercing missing ratings to 0 or
      // NULL would either bias the correlation (0 is a real rating
      // value) or blow up the coefficient (NULL averages propagate).
      // See `JudgeFeedbackPairRow` in ./interface.ts for the same
      // invariant expressed at the type layer.
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
        // Mirror the caller's `version` argument: a concrete value means
        // the stats are scoped to that revision; null signals a roll-up
        // across every version of the variant. GraphQL exposes `version`
        // as nullable so consumers can tell the two cases apart without
        // relying on a magic sentinel.
        version: version ?? null,
      };
    });
  }

  /**
   * Per-template breakdown for the A/B comparison admin screen. Each
   * row is a single template revision (one `t_report_templates` row),
   * plus aggregated feedback stats over the Reports that used it and
   * the per-Report (judgeScore, avgRating) pair set the service runs
   * Pearson's r over.
   *
   * `t_report_templates` is the LEFT side so a template with zero
   * Reports / zero feedbacks still appears with `feedbackCount: 0`;
   * the UI displays `—` for the metrics rather than dropping the row.
   *
   * Pagination is `id ASC` for cursor stability — the admin UI sorts
   * the page client-side by version / metrics. With ~20 rows per page
   * the cost of resorting in JS is negligible compared with the SQL
   * complexity of stable cursor pagination over a derived field.
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
  ): Promise<{ items: TemplateBreakdownRow[]; totalCount: number }> {
    return ctx.issuer.public(ctx, async (tx) => {
      // Compose the where clause once and reuse for both the page query
      // and the totalCount query so the two stay in lock-step (a where
      // drift would let totalCount disagree with what edges expose).
      const where: Prisma.ReportTemplateWhereInput = {
        variant: params.variant,
        kind: params.kind,
        ...(params.version !== undefined ? { version: params.version } : {}),
        ...(params.includeInactive ? {} : { isActive: true, isEnabled: true }),
      };

      const [templates, totalCount] = await Promise.all([
        tx.reportTemplate.findMany({
          where,
          select: {
            id: true,
            version: true,
            scope: true,
            kind: true,
            experimentKey: true,
            isActive: true,
            isEnabled: true,
            trafficWeight: true,
          },
          orderBy: { id: "asc" },
          take: params.first + 1,
          ...(params.cursor && { skip: 1, cursor: { id: params.cursor } }),
        }),
        tx.reportTemplate.count({ where }),
      ]);

      if (templates.length === 0) {
        return { items: [], totalCount };
      }

      const templateIds = templates.map((t) => t.id);

      // Aggregate feedback (count + avg rating) per template, plus
      // avg judge score, in two grouped queries. Doing two grouped
      // aggregates is cheaper than a single join because the ratings
      // table can have many rows per Report whereas judgeScore is a
      // per-Report scalar — joining naively would multiply the
      // Report-level judgeScore by the number of feedback rows.
      const [feedbackByTemplate, judgeByTemplate, pairRows] = await Promise.all([
        tx.$queryRaw<
          { template_id: string; feedback_count: bigint; avg_rating: number | null }[]
        >`
          SELECT
            r."template_id"::text AS "template_id",
            COUNT(f."id")::bigint AS "feedback_count",
            AVG(f."rating")::float AS "avg_rating"
          FROM "t_report_feedbacks" f
          INNER JOIN "t_reports" r ON r."id" = f."report_id"
          WHERE r."template_id" = ANY(${templateIds}::text[])
          GROUP BY r."template_id"
        `,
        tx.$queryRaw<
          { template_id: string; avg_judge_score: number | null }[]
        >`
          SELECT
            "template_id"::text AS "template_id",
            AVG("judge_score")::float AS "avg_judge_score"
          FROM "t_reports"
          WHERE "template_id" = ANY(${templateIds}::text[])
            AND "judge_score" IS NOT NULL
          GROUP BY "template_id"
        `,
        // Pearson pairs: one (judgeScore, avgRating) per Report that
        // has both signals. Requires the inner join on feedbacks so
        // Reports with judgeScore but no feedback are excluded — they
        // would otherwise need to be coerced to null and bias the
        // correlation downstream.
        tx.$queryRaw<
          {
            template_id: string;
            report_id: string;
            judge_score: number;
            avg_rating: number;
          }[]
        >`
          SELECT
            r."template_id"::text AS "template_id",
            r."id" AS "report_id",
            r."judge_score"::float AS "judge_score",
            AVG(f."rating")::float AS "avg_rating"
          FROM "t_reports" r
          INNER JOIN "t_report_feedbacks" f ON f."report_id" = r."id"
          WHERE r."template_id" = ANY(${templateIds}::text[])
            AND r."judge_score" IS NOT NULL
          GROUP BY r."template_id", r."id", r."judge_score"
        `,
      ]);

      const feedbackMap = new Map(
        feedbackByTemplate.map((row) => [
          row.template_id,
          {
            feedbackCount: Number(row.feedback_count),
            avgRating: row.avg_rating,
          },
        ]),
      );
      const judgeMap = new Map(
        judgeByTemplate.map((row) => [row.template_id, row.avg_judge_score]),
      );
      const pairsByTemplate = new Map<string, JudgeFeedbackPairRow[]>();
      for (const p of pairRows) {
        const list = pairsByTemplate.get(p.template_id) ?? [];
        list.push({
          reportId: p.report_id,
          judgeScore: Number(p.judge_score),
          avgRating: Number(p.avg_rating),
        });
        pairsByTemplate.set(p.template_id, list);
      }

      // `take: first + 1` pagination convention; the presenter trims
      // the extra row to derive `hasNextPage`. Keep all the templates
      // here so the trim happens after Pearson math, with consistent
      // payload shape across the layer.
      const items: TemplateBreakdownRow[] = templates.map((t) => {
        const feedback = feedbackMap.get(t.id);
        return {
          templateId: t.id,
          version: t.version,
          scope: t.scope as ReportTemplateScope,
          kind: t.kind as ReportTemplateKind,
          experimentKey: t.experimentKey,
          isActive: t.isActive,
          isEnabled: t.isEnabled,
          trafficWeight: t.trafficWeight,
          feedbackCount: feedback?.feedbackCount ?? 0,
          avgRating: feedback?.avgRating ?? null,
          avgJudgeScore: judgeMap.get(t.id) ?? null,
          pairs: pairsByTemplate.get(t.id) ?? [],
        };
      });

      return { items, totalCount };
    });
  }
}
