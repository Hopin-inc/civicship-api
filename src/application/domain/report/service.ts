import { Prisma } from "@prisma/client";
import { inject, injectable } from "tsyringe";
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

@injectable()
export default class ReportService {
  constructor(
    @inject("ReportRepository") private readonly repository: IReportRepository,
  ) {}

  async getDailySummaries(
    ctx: IContext,
    communityId: string,
    range: DateRange,
  ): Promise<TransactionSummaryDailyRow[]> {
    return this.repository.findDailySummaries(ctx, communityId, range);
  }

  async getDailyActiveUsers(
    ctx: IContext,
    communityId: string,
    range: DateRange,
  ): Promise<TransactionActiveUsersDailyRow[]> {
    return this.repository.findDailyActiveUsers(ctx, communityId, range);
  }

  async getUserAggregated(
    ctx: IContext,
    communityId: string,
    range: DateRange,
  ): Promise<UserTransactionAggregateRow[]> {
    return this.repository.findUserAggregatedInRange(ctx, communityId, range);
  }

  async getComments(
    ctx: IContext,
    communityId: string,
    range: DateRange,
    limit?: number,
  ): Promise<TransactionCommentRow[]> {
    return this.repository.findCommentsByDateRange(ctx, communityId, range, limit);
  }

  async getUserProfiles(
    ctx: IContext,
    communityId: string,
    userIds: string[],
  ): Promise<UserProfileForReportRow[]> {
    return this.repository.findUserProfiles(ctx, communityId, userIds);
  }

  async refreshTransactionSummaryDaily(
    ctx: IContext,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    return this.repository.refreshTransactionSummaryDaily(ctx, tx);
  }

  async refreshUserTransactionDaily(
    ctx: IContext,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    return this.repository.refreshUserTransactionDaily(ctx, tx);
  }
}
