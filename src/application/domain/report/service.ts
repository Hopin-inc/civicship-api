import { inject, injectable } from "tsyringe";
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

  async getDailyUserTransactions(
    ctx: IContext,
    communityId: string,
    range: DateRange,
  ): Promise<UserTransactionDailyRow[]> {
    return this.repository.findDailyUserTransactions(ctx, communityId, range);
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

  async refreshAllReportViews(ctx: IContext): Promise<void> {
    // Refresh is not transactional (CONCURRENTLY cannot run inside a tx block
    // in some Postgres configurations; typedSQL runs each statement
    // individually via $queryRawTyped). We wrap each call in its own
    // internal issuer block so bypassRls is applied per-statement.
    await ctx.issuer.internal((tx) =>
      this.repository.refreshTransactionSummaryDaily(ctx, tx),
    );
    await ctx.issuer.internal((tx) =>
      this.repository.refreshTransactionActiveUsersDaily(ctx, tx),
    );
    await ctx.issuer.internal((tx) =>
      this.repository.refreshUserTransactionDaily(ctx, tx),
    );
  }
}
