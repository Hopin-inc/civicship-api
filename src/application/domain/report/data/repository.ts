import {
  Prisma,
  ReportStatus,
  ReportTemplateKind,
  ReportTemplateScope,
  TransactionReason,
} from "@prisma/client";
import { injectable } from "tsyringe";
import { IContext } from "@/types/server";
import {
  CommunityContextRow,
  DateRange,
  DeepestChainRow,
  IReportRepository,
  TransactionActiveUsersDailyRow,
  TransactionCommentRow,
  TransactionSummaryDailyRow,
  UserProfileForReportRow,
  UserTransactionAggregateRow,
} from "@/application/domain/report/data/interface";
import {
  PrismaReport,
  PrismaReportGoldenCase,
  PrismaReportTemplate,
  reportGoldenCaseSelect,
  reportSelect,
  reportTemplateSelect,
} from "@/application/domain/report/data/type";
import {
  refreshMaterializedViewTransactionSummaryDaily,
  refreshMaterializedViewUserTransactionDaily,
} from "@prisma/client/sql";

const DEFAULT_COMMENT_LIMIT = 200;

@injectable()
export default class ReportRepository implements IReportRepository {
  async findDailySummaries(
    ctx: IContext,
    communityId: string,
    range: DateRange,
  ): Promise<TransactionSummaryDailyRow[]> {
    return ctx.issuer.public(ctx, (tx) =>
      tx.transactionSummaryDailyView.findMany({
        where: {
          communityId,
          date: { gte: range.from, lte: range.to },
        },
        orderBy: [{ date: "asc" }, { reason: "asc" }],
      }),
    );
  }

  /**
   * Derive (date, active_users, senders, receivers) straight from
   * mv_user_transaction_daily. Aggregating in SQL with FILTER clauses keeps
   * us from shipping a separate MV just for distinct-count queries.
   *
   * `date` is an `@db.Date` column; the explicit `::date` cast on the bound
   * parameters avoids Postgres treating the JS Date as a timestamp(tz) and
   * losing the index on a boundary compare.
   */
  async findDailyActiveUsers(
    ctx: IContext,
    communityId: string,
    range: DateRange,
  ): Promise<TransactionActiveUsersDailyRow[]> {
    return ctx.issuer.public(ctx, async (tx) => {
      const rows = await tx.$queryRaw<
        {
          date: Date;
          active_users: number;
          senders: number;
          receivers: number;
        }[]
      >`
        SELECT
          "date",
          COUNT(DISTINCT "user_id")::int AS "active_users",
          COUNT(DISTINCT "user_id") FILTER (WHERE "tx_count_out" > 0)::int AS "senders",
          COUNT(DISTINCT "user_id") FILTER (WHERE "tx_count_in" > 0)::int AS "receivers"
        FROM "mv_user_transaction_daily"
        WHERE "community_id" = ${communityId}
          AND "date" BETWEEN ${range.from}::date AND ${range.to}::date
        GROUP BY "date"
        ORDER BY "date" ASC
      `;
      return rows.map((r) => ({
        date: r.date,
        communityId,
        activeUsers: r.active_users,
        senders: r.senders,
        receivers: r.receivers,
      }));
    });
  }

  /**
   * Top-N user aggregates over the reporting window, ranked by total
   * points (in + out). The ORDER BY / LIMIT live in SQL so we only ship
   * the winners to Node — no sort/slice over every community member.
   */
  async findTopUsersByTotalPoints(
    ctx: IContext,
    communityId: string,
    range: DateRange,
    topN: number,
  ): Promise<UserTransactionAggregateRow[]> {
    return ctx.issuer.public(ctx, async (tx) => {
      const rows = await tx.$queryRaw<
        {
          user_id: string;
          tx_count_in: number;
          tx_count_out: number;
          points_in: bigint;
          points_out: bigint;
          donation_out_count: number;
          donation_out_points: bigint;
          received_donation_count: number;
          chain_root_count: number;
          max_chain_depth_started: number | null;
          chain_depth_reached_max: number | null;
          unique_counterparties_sum: number;
        }[]
      >`
        SELECT
          "user_id",
          COALESCE(SUM("tx_count_in"), 0)::int AS "tx_count_in",
          COALESCE(SUM("tx_count_out"), 0)::int AS "tx_count_out",
          COALESCE(SUM("points_in"), 0)::bigint AS "points_in",
          COALESCE(SUM("points_out"), 0)::bigint AS "points_out",
          COALESCE(SUM("donation_out_count"), 0)::int AS "donation_out_count",
          COALESCE(SUM("donation_out_points"), 0)::bigint AS "donation_out_points",
          COALESCE(SUM("received_donation_count"), 0)::int AS "received_donation_count",
          COALESCE(SUM("chain_root_count"), 0)::int AS "chain_root_count",
          MAX("max_chain_depth_started")::int AS "max_chain_depth_started",
          MAX("chain_depth_reached_max")::int AS "chain_depth_reached_max",
          COALESCE(SUM("unique_counterparties"), 0)::int AS "unique_counterparties_sum"
        FROM "mv_user_transaction_daily"
        WHERE "community_id" = ${communityId}
          AND "date" BETWEEN ${range.from}::date AND ${range.to}::date
        GROUP BY "user_id"
        ORDER BY (COALESCE(SUM("points_in"), 0) + COALESCE(SUM("points_out"), 0)) DESC
        LIMIT ${topN}
      `;
      return rows.map((r) => ({
        userId: r.user_id,
        txCountIn: r.tx_count_in,
        txCountOut: r.tx_count_out,
        pointsIn: r.points_in,
        pointsOut: r.points_out,
        donationOutCount: r.donation_out_count,
        donationOutPoints: r.donation_out_points,
        receivedDonationCount: r.received_donation_count,
        chainRootCount: r.chain_root_count,
        maxChainDepthStarted: r.max_chain_depth_started,
        chainDepthReachedMax: r.chain_depth_reached_max,
        uniqueCounterpartiesSum: r.unique_counterparties_sum,
      }));
    });
  }

  async findCommentsByDateRange(
    ctx: IContext,
    communityId: string,
    range: DateRange,
    limit: number = DEFAULT_COMMENT_LIMIT,
  ): Promise<TransactionCommentRow[]> {
    return ctx.issuer.public(ctx, (tx) =>
      tx.transactionCommentView.findMany({
        where: {
          communityId,
          date: { gte: range.from, lte: range.to },
        },
        orderBy: [{ createdAt: "desc" }],
        take: limit,
      }),
    );
  }

  async findUserProfiles(
    ctx: IContext,
    communityId: string,
    userIds: string[],
  ): Promise<UserProfileForReportRow[]> {
    if (userIds.length === 0) return [];
    return ctx.issuer.public(ctx, (tx) =>
      tx.userProfileForReportView.findMany({
        where: {
          communityId,
          userId: { in: userIds },
        },
      }),
    );
  }

  /**
   * Pull community identity + reporting-window activity stats in a single
   * round trip. Member count lives in `t_memberships` (RLS-protected but
   * read-safe for community members and admins via `issuer.public`), and
   * the distinct active-user count is scanned directly off
   * `mv_user_transaction_daily` for the same JST window used by the report
   * helpers elsewhere in this file.
   *
   * Returns null when the community is not found; the presenter treats this
   * as an optional block so the payload still serialises for a soft-deleted
   * or mis-passed community id.
   */
  async findCommunityContext(
    ctx: IContext,
    communityId: string,
    range: DateRange,
  ): Promise<CommunityContextRow | null> {
    return ctx.issuer.public(ctx, async (tx) => {
      const rows = await tx.$queryRaw<
        {
          id: string;
          name: string;
          point_name: string;
          bio: string | null;
          established_at: Date | null;
          website: string | null;
          total_members: number;
          active_users_in_window: number;
        }[]
      >`
        WITH member_count AS (
          SELECT COUNT(*)::int AS n
          FROM "t_memberships"
          WHERE "community_id" = ${communityId}
            AND "status" = 'JOINED'
        ),
        active_in_window AS (
          SELECT COUNT(DISTINCT "user_id")::int AS n
          FROM "mv_user_transaction_daily"
          WHERE "community_id" = ${communityId}
            AND "date" BETWEEN ${range.from}::date AND ${range.to}::date
        )
        SELECT
          c."id",
          c."name",
          c."point_name",
          c."bio",
          c."established_at",
          c."website",
          (SELECT n FROM member_count) AS "total_members",
          (SELECT n FROM active_in_window) AS "active_users_in_window"
        FROM "t_communities" c
        WHERE c."id" = ${communityId}
        LIMIT 1
      `;
      if (rows.length === 0) return null;
      const r = rows[0];
      return {
        communityId: r.id,
        name: r.name,
        pointName: r.point_name,
        bio: r.bio,
        establishedAt: r.established_at,
        website: r.website,
        totalMembers: r.total_members,
        activeUsersInWindow: r.active_users_in_window,
      };
    });
  }

  /**
   * The single transaction with the largest `chain_depth` within the JST
   * reporting window. Mirrors the community-scoping predicate used by
   * `mv_transaction_summary_daily` / `v_transaction_comments`:
   * `COALESCE(fw.community_id, tw.community_id) = $1` plus the
   * defensive-consistency check that rejects cross-community pairs.
   *
   * ORDER BY depth DESC, created_at ASC so that ties resolve to the
   * *earliest* deep chain in the window — intuitively "the one that started
   * the cascade" rather than whichever the planner picked first. Returns
   * null when no chained transaction exists for the window.
   */
  async findDeepestChain(
    ctx: IContext,
    communityId: string,
    range: DateRange,
  ): Promise<DeepestChainRow | null> {
    return ctx.issuer.public(ctx, async (tx) => {
      const rows = await tx.$queryRaw<
        {
          id: string;
          chain_depth: number;
          reason: TransactionReason;
          comment: string | null;
          date: Date;
          from_user_id: string | null;
          to_user_id: string | null;
          created_by_user_id: string | null;
          parent_tx_id: string | null;
        }[]
      >`
        SELECT
          t."id",
          t."chain_depth"::int AS "chain_depth",
          t."reason",
          t."comment",
          ((t."created_at" AT TIME ZONE 'Asia/Tokyo')::date) AS "date",
          fw."user_id" AS "from_user_id",
          tw."user_id" AS "to_user_id",
          t."created_by" AS "created_by_user_id",
          t."parent_tx_id"
        FROM "t_transactions" t
        LEFT JOIN "t_wallets" fw ON fw."id" = t."from"
        LEFT JOIN "t_wallets" tw ON tw."id" = t."to"
        WHERE COALESCE(fw."community_id", tw."community_id") = ${communityId}
          AND (fw."community_id" IS NULL
               OR tw."community_id" IS NULL
               OR fw."community_id" = tw."community_id")
          AND t."chain_depth" IS NOT NULL
          -- SARGable timestamptz comparison so the planner can use the
          -- B-tree index on "created_at" (wrapping it in
          -- (... AT TIME ZONE ...)::date would suppress the index).
          -- Half-open window [from JST 00:00, (to + 1 day) JST 00:00)
          -- covers exactly the JST calendar days from..to inclusive,
          -- matching the bucketing used by the report MVs.
          AND t."created_at" >= (${range.from}::date AT TIME ZONE 'Asia/Tokyo')
          AND t."created_at" <  ((${range.to}::date + 1) AT TIME ZONE 'Asia/Tokyo')
        ORDER BY t."chain_depth" DESC, t."created_at" ASC
        LIMIT 1
      `;
      if (rows.length === 0) return null;
      const r = rows[0];
      return {
        transactionId: r.id,
        chainDepth: r.chain_depth,
        reason: r.reason,
        comment: r.comment,
        date: r.date,
        fromUserId: r.from_user_id,
        toUserId: r.to_user_id,
        createdByUserId: r.created_by_user_id,
        parentTxId: r.parent_tx_id,
      };
    });
  }

  async refreshTransactionSummaryDaily(ctx: IContext, tx: Prisma.TransactionClient): Promise<void> {
    await tx.$queryRawTyped(refreshMaterializedViewTransactionSummaryDaily());
  }

  async refreshUserTransactionDaily(ctx: IContext, tx: Prisma.TransactionClient): Promise<void> {
    await tx.$queryRawTyped(refreshMaterializedViewUserTransactionDaily());
  }

  // =========================================================================
  // Report AI entities (ReportTemplate / Report)
  // =========================================================================

  async findTemplate(
    ctx: IContext,
    variant: string,
    communityId: string | null,
  ): Promise<PrismaReportTemplate | null> {
    return ctx.issuer.public(ctx, (tx) =>
      tx.reportTemplate.findFirst({
        where: {
          variant,
          kind: ReportTemplateKind.GENERATION,
          isEnabled: true,
          OR: [...(communityId ? [{ communityId }] : []), { communityId: null }],
        },
        orderBy: { communityId: "asc" },
        select: reportTemplateSelect,
      }),
    );
  }

  /**
   * Active candidates for (variant, kind, communityId). Unlike `findTemplate`
   * this does NOT fall back to SYSTEM when `communityId` is non-null — the
   * caller (the selector) must issue a separate SYSTEM query when the
   * community-scoped query returns empty, because it needs to distinguish
   * "community has its own A/B set" from "community uses SYSTEM". Only
   * `isEnabled=true AND isActive=true` rows are returned so deprecated /
   * rolled-back candidates never enter the weighted draw.
   */
  async findActiveTemplates(
    ctx: IContext,
    variant: string,
    kind: ReportTemplateKind,
    communityId: string | null,
  ): Promise<PrismaReportTemplate[]> {
    return ctx.issuer.public(ctx, (tx) =>
      tx.reportTemplate.findMany({
        where: {
          variant,
          kind,
          communityId,
          isEnabled: true,
          isActive: true,
        },
        orderBy: { id: "asc" },
        select: reportTemplateSelect,
      }),
    );
  }

  /**
   * Resolve the active SYSTEM-scope JUDGE template for a variant.
   * Filters on `isEnabled` AND `isActive` so the F1 versioning bookkeeping
   * also gates judge selection — a JUDGE row marked inactive (e.g. a
   * candidate prompt that is being rolled back) is skipped.
   * `communityId IS NULL` is hardcoded because the application-layer
   * guard rejects COMMUNITY-scope JUDGE templates upstream; encoding the
   * same constraint here means a stray COMMUNITY judge row that
   * somehow gets seeded in the future will not silently take effect.
   */
  async findJudgeTemplate(
    ctx: IContext,
    variant: string,
  ): Promise<PrismaReportTemplate | null> {
    return ctx.issuer.public(ctx, (tx) =>
      tx.reportTemplate.findFirst({
        where: {
          variant,
          kind: ReportTemplateKind.JUDGE,
          communityId: null,
          isEnabled: true,
          isActive: true,
        },
        orderBy: { version: "desc" },
        select: reportTemplateSelect,
      }),
    );
  }

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

  async findGoldenCases(
    ctx: IContext,
    variant?: string,
  ): Promise<PrismaReportGoldenCase[]> {
    return ctx.issuer.public(ctx, (tx) =>
      tx.reportGoldenCase.findMany({
        where: variant ? { variant } : undefined,
        select: reportGoldenCaseSelect,
        orderBy: [{ variant: "asc" }, { label: "asc" }],
      }),
    );
  }

  async upsertGoldenCase(
    ctx: IContext,
    data: {
      variant: string;
      label: string;
      payloadFixture: Prisma.InputJsonValue;
      judgeCriteria: Prisma.InputJsonValue;
      minJudgeScore: number;
      forbiddenKeys: string[];
      notes?: string | null;
      expectedStatus?: ReportStatus | null;
    },
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaReportGoldenCase> {
    const doUpsert = (client: Prisma.TransactionClient) =>
      client.reportGoldenCase.upsert({
        where: { variant_label: { variant: data.variant, label: data.label } },
        create: {
          variant: data.variant,
          label: data.label,
          payloadFixture: data.payloadFixture,
          judgeCriteria: data.judgeCriteria,
          minJudgeScore: data.minJudgeScore,
          forbiddenKeys: data.forbiddenKeys,
          notes: data.notes ?? null,
          expectedStatus: data.expectedStatus ?? null,
        },
        update: {
          payloadFixture: data.payloadFixture,
          judgeCriteria: data.judgeCriteria,
          minJudgeScore: data.minJudgeScore,
          forbiddenKeys: data.forbiddenKeys,
          notes: data.notes ?? null,
          expectedStatus: data.expectedStatus ?? null,
        },
        select: reportGoldenCaseSelect,
      });

    if (tx) return doUpsert(tx);
    return ctx.issuer.internal(doUpsert);
  }

  async upsertTemplate(
    ctx: IContext,
    variant: string,
    communityId: string | null,
    data: Omit<Prisma.ReportTemplateCreateInput, "variant" | "scope" | "community">,
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaReportTemplate> {
    const scope = communityId ? ReportTemplateScope.COMMUNITY : ReportTemplateScope.SYSTEM;
    // The admin GraphQL mutation that calls this only edits GENERATION
    // templates (the GqlUpdateReportTemplateInput has no `kind` field).
    // Pin the lookup + create to GENERATION so the JUDGE rows added in
    // PR-F7 cannot be accidentally overwritten when a (variant,
    // communityId) pair has both a GENERATION and a JUDGE row at v1.
    // When an admin path for editing JUDGE templates is added, this
    // method should grow a `kind` parameter and thread it through.
    const kind = ReportTemplateKind.GENERATION;
    const doUpsert = async (client: Prisma.TransactionClient) => {
      const existing = await client.reportTemplate.findFirst({
        where: { variant, communityId, kind },
        select: { id: true },
      });
      if (existing) {
        return client.reportTemplate.update({
          where: { id: existing.id },
          data,
          select: reportTemplateSelect,
        });
      }
      try {
        return await client.reportTemplate.create({
          data: {
            ...data,
            variant,
            scope,
            kind,
            ...(communityId ? { community: { connect: { id: communityId } } } : {}),
          },
          select: reportTemplateSelect,
        });
      } catch (e: unknown) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
          const raced = await client.reportTemplate.findFirst({
            where: { variant, communityId, kind },
            select: { id: true },
          });
          if (raced) {
            return client.reportTemplate.update({
              where: { id: raced.id },
              data,
              select: reportTemplateSelect,
            });
          }
        }
        throw e;
      }
    };

    if (tx) return doUpsert(tx);
    return ctx.issuer.internal(doUpsert);
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
