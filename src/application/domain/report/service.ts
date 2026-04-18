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
import { WeeklyReportPayload } from "@/application/domain/report/presenter";

/**
 * Prefix convention for `Report.skipReason`. New skip categories (e.g. API
 * outages, payload-builder data inconsistencies) should follow the same
 * `"<Category>:"` shape so log analysis can bucket them with
 * `WHERE skip_reason LIKE 'No activity%'`.
 */
export const SKIP_REASON_NO_ACTIVITY_PREFIX = "No activity in period";

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
    updatedBy: string,
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaReportTemplate> {
    const data = { ...ReportConverter.toReportTemplateUpsertData(input), updatedBy };
    return this.repository.upsertTemplate(ctx, variant, communityId, data, tx);
  }

  async createReport(
    ctx: IContext,
    data: Prisma.ReportUncheckedCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaReport> {
    return this.repository.createReport(ctx, data, tx);
  }

  async getReportById(
    ctx: IContext,
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaReport | null> {
    return this.repository.findReportById(ctx, id, tx);
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

  /**
   * Decide whether a freshly-built payload is too empty to be worth sending
   * to the LLM. Returns a human-readable `skipReason` string (prefixed so
   * ops can bucket reasons with `LIKE 'No activity%'`) when the run should
   * short-circuit to `ReportStatus.SKIPPED`; returns `null` when the LLM
   * should be invoked as usual.
   *
   * Zero-activity is defined as BOTH `active_users_in_window === 0` AND
   * `daily_summaries.length === 0`. Using AND (rather than OR on either
   * signal) avoids false-positive skips on weeks that contain only
   * GRANT or ONBOARDING transactions — those would push up one counter
   * without the other in edge cases, and their existence is itself
   * report-worthy.
   *
   * A null `community_context` is still treated as zero activity (the
   * community context view returns null only when there are no JOINED
   * members yet), but the skipReason records `community_context=null`
   * explicitly so ops can tell a legitimately-empty community apart from
   * a normal zero-activity week. Both variants share the same
   * `SKIP_REASON_NO_ACTIVITY_PREFIX`, so `skip_reason LIKE 'No activity%'`
   * continues to bucket them together.
   */
  evaluateSkipReason(payload: WeeklyReportPayload): string | null {
    if (payload.daily_summaries.length > 0) return null;
    if (payload.community_context === null) {
      return `${SKIP_REASON_NO_ACTIVITY_PREFIX}: community_context=null, daily_summaries=[]`;
    }
    if (payload.community_context.active_users_in_window === 0) {
      return `${SKIP_REASON_NO_ACTIVITY_PREFIX}: active_users=0, daily_summaries=[]`;
    }
    return null;
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
      // SKIPPED is a creation-time state: rows are born SKIPPED when the
      // zero-activity guard elides the LLM call. They do NOT progress into
      // DRAFT / APPROVED / PUBLISHED (there is no generated content to
      // review or publish), but SUPERSEDED is permitted so a subsequent
      // force-regenerate — e.g. an operator overriding the skip decision
      // by calling generateReport with parentRunId set to the SKIPPED row
      // — can mark the prior row obsolete via the shared
      // supersedeParentIfRegenerating path.
      [ReportStatus.SKIPPED]: [ReportStatus.SUPERSEDED],
    };
    if (!allowed[from]?.includes(to)) {
      throw new Error(`Invalid status transition from ${from} to ${to}`);
    }
  }
}
