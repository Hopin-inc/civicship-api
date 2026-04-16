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
          AND "date" BETWEEN ${range.from} AND ${range.to}
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
   * Per-user aggregate over the reporting window. Uses Prisma `groupBy` so
   * the sum / max is computed in the database and we do not drag every
   * per-day row into Node for reduction.
   */
  async findUserAggregatedInRange(
    ctx: IContext,
    communityId: string,
    range: DateRange,
  ): Promise<UserTransactionAggregateRow[]> {
    return ctx.issuer.public(ctx, async (tx) => {
      const rows = await tx.userTransactionDailyView.groupBy({
        by: ["userId"],
        where: {
          communityId,
          date: { gte: range.from, lte: range.to },
        },
        _sum: {
          txCountIn: true,
          txCountOut: true,
          pointsIn: true,
          pointsOut: true,
          donationOutCount: true,
          donationOutPoints: true,
          receivedDonationCount: true,
          chainRootCount: true,
          uniqueCounterparties: true,
        },
        _max: {
          maxChainDepthStarted: true,
          chainDepthReachedMax: true,
        },
      });
      return rows.map((r) => ({
        userId: r.userId,
        txCountIn: r._sum.txCountIn ?? 0,
        txCountOut: r._sum.txCountOut ?? 0,
        pointsIn: r._sum.pointsIn ?? 0n,
        pointsOut: r._sum.pointsOut ?? 0n,
        donationOutCount: r._sum.donationOutCount ?? 0,
        donationOutPoints: r._sum.donationOutPoints ?? 0n,
        receivedDonationCount: r._sum.receivedDonationCount ?? 0,
        chainRootCount: r._sum.chainRootCount ?? 0,
        maxChainDepthStarted: r._max.maxChainDepthStarted ?? null,
        chainDepthReachedMax: r._max.chainDepthReachedMax ?? null,
        uniqueCounterpartiesSum: r._sum.uniqueCounterparties ?? 0,
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
