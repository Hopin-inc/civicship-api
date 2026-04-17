import { Prisma, ReportStatus } from "@prisma/client";
import { inject, injectable } from "tsyringe";
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
import { PrismaReport, PrismaReportTemplate } from "@/application/domain/report/data/type";
import { GqlUpdateReportTemplateInput } from "@/types/graphql";
import ReportConverter from "@/application/domain/report/data/converter";

@injectable()
export default class ReportService {
  constructor(@inject("ReportRepository") private readonly repository: IReportRepository) {}

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

  async getTopUsersByTotalPoints(
    ctx: IContext,
    communityId: string,
    range: DateRange,
    topN: number,
  ): Promise<UserTransactionAggregateRow[]> {
    return this.repository.findTopUsersByTotalPoints(ctx, communityId, range, topN);
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

  async getCommunityContext(
    ctx: IContext,
    communityId: string,
    range: DateRange,
  ): Promise<CommunityContextRow | null> {
    return this.repository.findCommunityContext(ctx, communityId, range);
  }

  async getDeepestChain(
    ctx: IContext,
    communityId: string,
    range: DateRange,
  ): Promise<DeepestChainRow | null> {
    return this.repository.findDeepestChain(ctx, communityId, range);
  }

  async refreshTransactionSummaryDaily(ctx: IContext, tx: Prisma.TransactionClient): Promise<void> {
    return this.repository.refreshTransactionSummaryDaily(ctx, tx);
  }

  async refreshUserTransactionDaily(ctx: IContext, tx: Prisma.TransactionClient): Promise<void> {
    return this.repository.refreshUserTransactionDaily(ctx, tx);
  }

  // =========================================================================
  // Report AI entities
  // =========================================================================

  async getTemplate(
    ctx: IContext,
    variant: string,
    communityId: string | null,
  ): Promise<PrismaReportTemplate | null> {
    return this.repository.findTemplate(ctx, variant, communityId);
  }

  async upsertTemplate(
    ctx: IContext,
    variant: string,
    communityId: string | null,
    input: GqlUpdateReportTemplateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaReportTemplate> {
    const data = ReportConverter.toReportTemplateUpsertData(input);
    return this.repository.upsertTemplate(ctx, variant, communityId, data, tx);
  }

  async createReport(
    ctx: IContext,
    data: Prisma.ReportUncheckedCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaReport> {
    return this.repository.createReport(ctx, data, tx);
  }

  async getReportById(ctx: IContext, id: string): Promise<PrismaReport | null> {
    return this.repository.findReportById(ctx, id);
  }

  async getReports(
    ctx: IContext,
    params: {
      communityId: string;
      variant?: string;
      status?: ReportStatus;
      cursor?: string;
      first?: number;
    },
  ): Promise<{ items: PrismaReport[]; totalCount: number }> {
    return this.repository.findReports(ctx, params);
  }

  async updateReportStatus(
    ctx: IContext,
    id: string,
    status: ReportStatus,
    extra?: { publishedAt?: Date; publishedBy?: string; finalContent?: string },
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaReport> {
    return this.repository.updateReportStatus(ctx, id, status, extra, tx);
  }

  assertStatusTransition(from: ReportStatus, to: ReportStatus): void {
    const allowed: Record<ReportStatus, ReportStatus[]> = {
      [ReportStatus.DRAFT]: [ReportStatus.APPROVED, ReportStatus.REJECTED, ReportStatus.SUPERSEDED],
      [ReportStatus.APPROVED]: [
        ReportStatus.PUBLISHED,
        ReportStatus.REJECTED,
        ReportStatus.SUPERSEDED,
      ],
      [ReportStatus.PUBLISHED]: [ReportStatus.SUPERSEDED],
      [ReportStatus.REJECTED]: [],
      [ReportStatus.SUPERSEDED]: [],
    };
    if (!allowed[from]?.includes(to)) {
      throw new Error(`Invalid status transition from ${from} to ${to}`);
    }
  }
}
