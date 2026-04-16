import { Prisma } from "@prisma/client";
import { injectable } from "tsyringe";
import { IContext } from "@/types/server";
import {
  DateRange,
  IReportRepository,
  TransactionActiveUsersDailyRow,
  TransactionCommentRow,
  TransactionSummaryDailyRow,
  UserProfileForReportRow,
  UserTransactionAggregateRow,
} from "@/application/domain/report/data/interface";
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

  async refreshTransactionSummaryDaily(
    ctx: IContext,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    await tx.$queryRawTyped(refreshMaterializedViewTransactionSummaryDaily());
  }

  async refreshUserTransactionDaily(
    ctx: IContext,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    await tx.$queryRawTyped(refreshMaterializedViewUserTransactionDaily());
  }
}
