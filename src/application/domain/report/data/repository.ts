import { Prisma, ReportStatus } from "@prisma/client";
import { injectable } from "tsyringe";
import { IContext } from "@/types/server";
import { IReportRepository } from "@/application/domain/report/data/interface";
import {
  CommunitySummaryCursor,
  PrismaReport,
  reportSelect,
} from "@/application/domain/report/data/type";

@injectable()
export default class ReportRepository implements IReportRepository {
  async updateReportJudgeResult(
    ctx: IContext,
    id: string,
    data: {
      judgeScore: number | null;
      judgeBreakdown: Prisma.InputJsonValue | null;
      judgeTemplateId: string | null;
      coverageJson: Prisma.InputJsonValue | null;
    },
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaReport> {
    const doUpdate = (client: Prisma.TransactionClient) =>
      client.report.update({
        where: { id },
        data: {
          judgeScore: data.judgeScore,
          // Use Prisma.DbNull (SQL NULL) rather than Prisma.JsonNull
          // (the JSON literal `null`). The schema comment on
          // judge_breakdown / coverage_json reads "left null", which
          // is SQL NULL — JsonNull would store a four-byte JSON `null`
          // value that survives `IS NULL` checks differently than
          // missing data and would force every consumer to handle two
          // distinct flavours of "no result" for the same column.
          judgeBreakdown: data.judgeBreakdown ?? Prisma.DbNull,
          judgeTemplateId: data.judgeTemplateId,
          coverageJson: data.coverageJson ?? Prisma.DbNull,
        },
        select: reportSelect,
      });

    if (tx) return doUpdate(tx);
    return ctx.issuer.internal(doUpdate);
  }

  async createReport(
    ctx: IContext,
    data: Prisma.ReportUncheckedCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaReport> {
    const doCreate = (client: Prisma.TransactionClient) =>
      client.report.create({ data, select: reportSelect });

    if (tx) return doCreate(tx);
    return ctx.issuer.internal(doCreate);
  }

  async findReportById(
    ctx: IContext,
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaReport | null> {
    const doFind = (client: Prisma.TransactionClient) =>
      client.report.findUnique({ where: { id }, select: reportSelect });

    if (tx) return doFind(tx);
    return ctx.issuer.public(ctx, doFind);
  }

  async findReports(
    ctx: IContext,
    params: {
      communityId: string;
      variant?: string;
      status?: ReportStatus;
      cursor?: string;
      first?: number;
    },
  ): Promise<{ items: PrismaReport[]; totalCount: number }> {
    const take = params.first ?? 20;
    const where: Prisma.ReportWhereInput = {
      communityId: params.communityId,
      ...(params.variant && { variant: params.variant }),
      status: params.status ?? { not: ReportStatus.SUPERSEDED },
    };
    return ctx.issuer.public(ctx, async (tx) => {
      const [items, totalCount] = await Promise.all([
        tx.report.findMany({
          where,
          select: reportSelect,
          take: take + 1,
          ...(params.cursor && { skip: 1, cursor: { id: params.cursor } }),
          orderBy: { createdAt: "desc" },
        }),
        tx.report.count({ where }),
      ]);
      return { items, totalCount };
    });
  }

  /**
   * sysAdmin cross-community report search. Distinct from `findReports`
   * (community-scoped, RLS-public): runs through `ctx.issuer.internal`
   * because the IsAdmin GraphQL directive is the only gatekeeper here,
   * and orders by publishedAt DESC NULLS LAST so DRAFT / SKIPPED rows
   * (publishedAt is null) sink rather than leading the page.
   *
   * Filters are all optional. The matching index
   * `idx_t_reports_published_at_created_at` (added in the
   * `add_admin_report_summary_columns` migration) backs the unfiltered
   * sweep; community / variant / status filters narrow before the
   * index sort completes.
   */
  async findAllReports(
    ctx: IContext,
    params: {
      communityId?: string;
      status?: ReportStatus;
      variant?: string;
      publishedAfter?: Date;
      publishedBefore?: Date;
      cursor?: string;
      first: number;
    },
  ): Promise<{ items: PrismaReport[]; totalCount: number }> {
    const where: Prisma.ReportWhereInput = {
      ...(params.communityId && { communityId: params.communityId }),
      ...(params.status && { status: params.status }),
      ...(params.variant && { variant: params.variant }),
      ...((params.publishedAfter || params.publishedBefore) && {
        publishedAt: {
          ...(params.publishedAfter && { gte: params.publishedAfter }),
          ...(params.publishedBefore && { lte: params.publishedBefore }),
        },
      }),
    };
    return ctx.issuer.internal(async (tx) => {
      const [items, totalCount] = await Promise.all([
        tx.report.findMany({
          where,
          select: reportSelect,
          take: params.first + 1,
          ...(params.cursor && { skip: 1, cursor: { id: params.cursor } }),
          orderBy: [
            { publishedAt: { sort: "desc", nulls: "last" } },
            { createdAt: "desc" },
            // id tie-breaker so `cursor: { id }` advances
            // deterministically when publishedAt + createdAt collide
            // (e.g. multiple reports created in the same millisecond
            // by a batch run, or the SKIPPED rows at the bottom that
            // share publishedAt=null).
            { id: "desc" },
          ],
        }),
        tx.report.count({ where }),
      ]);
      return { items, totalCount };
    });
  }

  /**
   * Per-community summary for `adminReportSummary`. Reads the
   * denormalized last-publish columns on `t_communities` directly so
   * the sort + cursor stay stable, then computes the rolling
   * 90-day publish count for the page's communityIds in a single
   * `GROUP BY` follow-up query — that count moves daily and is not
   * worth denormalizing, but the per-row correlated subquery shape
   * was needlessly O(first) under load.
   *
   * Sort `last_published_report_at ASC NULLS FIRST, id ASC` floats
   * dormant / never-published communities to the top so the L1 view
   * surfaces them first.
   *
   * Cursor pagination uses a *composite* cursor `{ at, id }` because
   * the primary sort key (`last_published_report_at`) is non-unique:
   * an `id`-only WHERE would skip rows whose at-value places them
   * after the cursor when their id happens to sort earlier. The two
   * branches below cover the NULLS-FIRST tier:
   *   - cursor.at === null (we're inside the dormant tier): keep
   *     paging through dormant rows by id, then spill over to the
   *     entire non-NULL tier.
   *   - cursor.at !== null (we're in the chronological tier): page
   *     by (at, id) lexicographically.
   */
  async findCommunityReportSummary(
    ctx: IContext,
    params: { cursor: CommunitySummaryCursor | null; first: number },
  ): Promise<{
    items: Array<{
      communityId: string;
      lastPublishedReportId: string | null;
      lastPublishedAt: Date | null;
      publishedCountLast90Days: number;
    }>;
    totalCount: number;
  }> {
    return ctx.issuer.internal(async (tx) => {
      // Wire-format decoding is the converter layer's job; this
      // method takes the already-decoded structured cursor (or null)
      // so the SQL composition stays pure data-layer.
      const { cursor } = params;
      const cursorClause = !cursor
        ? Prisma.empty
        : cursor.at === null
          ? Prisma.sql`AND (
              (c."last_published_report_at" IS NULL AND c."id" > ${cursor.id})
              OR c."last_published_report_at" IS NOT NULL
            )`
          : Prisma.sql`AND (
              c."last_published_report_at" > ${cursor.at}::timestamp
              OR (
                c."last_published_report_at" = ${cursor.at}::timestamp
                AND c."id" > ${cursor.id}
              )
            )`;
      // Two-query strategy: first page through communities by the
      // denormalized last-publish columns (one index range scan),
      // then aggregate the rolling 90-day publish count for just
      // that page's communityIds in a single GROUP BY. This keeps
      // DB round-trips and scan count constant in `first` rather
      // than O(first) correlated subqueries on the L1 hot path.
      const [rows, totalRow] = await Promise.all([
        tx.$queryRaw<
          {
            id: string;
            last_published_report_id: string | null;
            last_published_report_at: Date | null;
          }[]
        >`
          SELECT
            c."id",
            c."last_published_report_id",
            c."last_published_report_at"
          FROM "t_communities" c
          WHERE TRUE
            ${cursorClause}
          ORDER BY
            c."last_published_report_at" ASC NULLS FIRST,
            c."id" ASC
          LIMIT ${params.first + 1}
        `,
        tx.community.count(),
      ]);
      const communityIds = rows.map((r) => r.id);
      const counts =
        communityIds.length === 0
          ? []
          : await tx.$queryRaw<
              { community_id: string; count: bigint }[]
            >`
              SELECT
                r."community_id",
                COUNT(*)::bigint AS "count"
              FROM "t_reports" r
              WHERE r."community_id" = ANY(${communityIds}::text[])
                AND r."status" = 'PUBLISHED'
                AND r."published_at" IS NOT NULL
                AND r."published_at" >= NOW() - INTERVAL '90 days'
              GROUP BY r."community_id"
            `;
      const countByCommunity = new Map(
        counts.map((c) => [c.community_id, Number(c.count)]),
      );
      return {
        items: rows.map((r) => ({
          communityId: r.id,
          lastPublishedReportId: r.last_published_report_id,
          lastPublishedAt: r.last_published_report_at,
          publishedCountLast90Days: countByCommunity.get(r.id) ?? 0,
        })),
        totalCount: totalRow,
      };
    });
  }

  /**
   * Re-derive a community's last-publish pointer from `t_reports`.
   * Idempotent: callers can invoke it after either a publish (new
   * PUBLISHED row) or a supersede of a PUBLISHED row, and the column
   * pair will reflect the current state.
   *
   * One UPDATE always runs. When no PUBLISHED row remains, the
   * `LEFT JOIN ... ON FALSE` collapses `sub` to a single null row so
   * the SET expressions evaluate to NULL — keeping the operation in
   * a single statement instead of a conditional second UPDATE.
   */
  async recalculateCommunityLastPublished(
    ctx: IContext,
    communityId: string,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    await tx.$executeRaw`
      UPDATE "t_communities" c
      SET
        "last_published_report_id" = sub."id",
        "last_published_report_at" = sub."published_at"
      FROM (
        SELECT NULL::text AS "id", NULL::timestamp AS "published_at"
        UNION ALL
        SELECT "id", "published_at"
        FROM "t_reports"
        WHERE "community_id" = ${communityId}
          AND "status" = 'PUBLISHED'
          AND "published_at" IS NOT NULL
        -- "id" DESC tie-breaks ties on published_at (e.g. batched
        -- publishes inside the same millisecond) so two replays of
        -- the recalc against the same DB state always pick the same
        -- row, not whichever happens to scan first.
        ORDER BY "published_at" DESC NULLS LAST, "id" DESC
        LIMIT 1
      ) sub
      WHERE c."id" = ${communityId}
    `;
  }

  async updateReportStatus(
    ctx: IContext,
    id: string,
    status: ReportStatus,
    extra?: {
      publishedAt?: Date;
      publishedBy?: string;
      finalContent?: string;
    },
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaReport> {
    const doUpdate = (client: Prisma.TransactionClient) =>
      client.report.update({
        where: { id },
        data: { status, ...extra },
        select: reportSelect,
      });

    if (tx) return doUpdate(tx);
    return ctx.issuer.internal(doUpdate);
  }

  async findReportsByParentRunId(ctx: IContext, parentRunIds: string[]): Promise<PrismaReport[]> {
    if (parentRunIds.length === 0) return [];
    return ctx.issuer.public(ctx, (tx) =>
      tx.report.findMany({
        where: { parentRunId: { in: parentRunIds } },
        select: reportSelect,
        orderBy: { createdAt: "desc" },
      }),
    );
  }
}
