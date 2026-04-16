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
  UserTransactionDailyRow,
} from "@/application/domain/report/data/interface";
import {
  refreshMaterializedViewTransactionSummaryDaily,
  refreshMaterializedViewTransactionActiveUsersDaily,
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

  async findDailyActiveUsers(
    ctx: IContext,
    communityId: string,
    range: DateRange,
  ): Promise<TransactionActiveUsersDailyRow[]> {
    return ctx.issuer.public(ctx, (tx) =>
      tx.transactionActiveUsersDailyView.findMany({
        where: {
          communityId,
          date: { gte: range.from, lte: range.to },
        },
        orderBy: [{ date: "asc" }],
      }),
    );
  }

  async findDailyUserTransactions(
    ctx: IContext,
    communityId: string,
    range: DateRange,
  ): Promise<UserTransactionDailyRow[]> {
    return ctx.issuer.public(ctx, (tx) =>
      tx.userTransactionDailyView.findMany({
        where: {
          communityId,
          date: { gte: range.from, lte: range.to },
        },
        orderBy: [{ date: "asc" }, { userId: "asc" }],
      }),
    );
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

  async refreshTransactionActiveUsersDaily(
    ctx: IContext,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    await tx.$queryRawTyped(refreshMaterializedViewTransactionActiveUsersDaily());
  }

  async refreshUserTransactionDaily(
    ctx: IContext,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    await tx.$queryRawTyped(refreshMaterializedViewUserTransactionDaily());
  }
}
