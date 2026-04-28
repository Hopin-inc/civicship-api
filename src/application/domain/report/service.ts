import { Prisma, ReportStatus, ReportTemplateKind } from "@prisma/client";
import { inject, injectable } from "tsyringe";
import { IContext } from "@/types/server";
import { IReportRepository } from "@/application/domain/report/data/interface";
import {
  CohortRetentionRow,
  CommunityContextRow,
  DateRange,
  DeepestChainRow,
  PeriodAggregateRow,
  RetentionAggregateRow,
  TransactionActiveUsersDailyRow,
  TransactionCommentRow,
  TransactionSummaryDailyRow,
  UserProfileForReportRow,
  UserTransactionAggregateRow,
} from "@/application/domain/report/data/rows";
import {
  PrismaReport,
  PrismaReportGoldenCase,
  PrismaReportTemplate,
} from "@/application/domain/report/data/type";
import { GqlUpdateReportTemplateInput } from "@/types/graphql";
import ReportConverter from "@/application/domain/report/data/converter";
import { WeeklyReportPayload } from "@/application/domain/report/types";

/**
 * Prefix convention for `Report.skipReason`. The constant itself stores only
 * the category text WITHOUT a trailing colon — callers append `":"` when
 * building the persisted reason string (see `evaluateSkipReason` below).
 * New skip categories (e.g. API outages, payload-builder data
 * inconsistencies) should follow the same `"<Category>:<detail>"` shape on
 * disk so log analysis can bucket them with
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

  async getTrueUniqueCounterpartiesForUsers(
    ctx: IContext,
    communityId: string,
    range: DateRange,
    userIds: string[],
  ): Promise<Map<string, number>> {
    return this.repository.findTrueUniqueCounterpartiesForUsers(ctx, communityId, range, userIds);
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

  async getPeriodAggregate(
    ctx: IContext,
    communityId: string,
    range: DateRange,
  ): Promise<PeriodAggregateRow> {
    return this.repository.findPeriodAggregate(ctx, communityId, range);
  }

  async getRetentionAggregate(
    ctx: IContext,
    communityId: string,
    range: {
      currentWeekStart: Date;
      nextWeekStart: Date;
      prevWeekStart: Date;
      twelveWeeksAgo: Date;
    },
  ): Promise<RetentionAggregateRow> {
    return this.repository.findRetentionAggregate(ctx, communityId, range);
  }

  async getCohortRetention(
    ctx: IContext,
    communityId: string,
    cohort: { cohortStart: Date; cohortEnd: Date },
    active: { activeStart: Date; activeEnd: Date },
  ): Promise<CohortRetentionRow> {
    return this.repository.findCohortRetention(ctx, communityId, cohort, active);
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

  /**
   * Phase 1 admin: list multiple template revisions for the management
   * UI. Pass-through to the repository — the repository handles the
   * SYSTEM ∪ COMMUNITY semantics and the includeInactive toggle, the
   * service is here purely so resolver/usecase tests can substitute a
   * mock without reaching into the repository.
   */
  async listTemplates(
    ctx: IContext,
    variant: string,
    communityId: string | null,
    kind: ReportTemplateKind,
    includeInactive: boolean,
  ): Promise<PrismaReportTemplate[]> {
    return this.repository.findTemplates(ctx, variant, communityId, kind, includeInactive);
  }

  /**
   * CI-only direct lookup by (variant, kind, version, communityId).
   * Wraps `IReportRepository.findTemplateByVersion` so the Golden Case
   * harness has the same service-shaped seam as the rest of the report
   * domain. Production resolvers must not use this — it bypasses the
   * `isActive` / `isEnabled` gates.
   *
   * `communityId` defaults to `null`, which selects the SYSTEM-scoped
   * row. The CI harness always fetches SYSTEM (`communityId=null`) since
   * COMMUNITY-scoped templates are not part of the shared golden
   * baseline. Callers may pass `communityId=null` explicitly when they
   * want the SYSTEM contract to be visible at the call site, but omitting
   * the argument has the same effect.
   */
  async getTemplateByVersion(
    ctx: IContext,
    variant: string,
    kind: ReportTemplateKind,
    version: number,
    communityId: string | null = null,
  ): Promise<PrismaReportTemplate | null> {
    return this.repository.findTemplateByVersion(ctx, variant, kind, version, communityId);
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

  /**
   * Phase 2 sysAdmin: cross-community report search backing
   * `adminBrowseReports`. Pass-through to the repository so the usecase
   * shape stays mock-friendly; the repo enforces the IsAdmin-only
   * scope via `ctx.issuer.internal` plus the `publishedAt DESC NULLS
   * LAST` ordering.
   */
  async getAllReports(
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
    return this.repository.findAllReports(ctx, params);
  }

  /**
   * Phase 2 sysAdmin: per-community last-publish summary backing
   * `adminReportSummary`. Returns the denormalized last-publish
   * pointer plus the rolling 90-day count; the resolver hydrates the
   * full Community / Report objects through dataloaders.
   */
  async getCommunityReportSummary(
    ctx: IContext,
    params: { cursor?: string; first: number },
  ): Promise<{
    items: Array<{
      communityId: string;
      lastPublishedReportId: string | null;
      lastPublishedAt: Date | null;
      publishedCountLast90Days: number;
    }>;
    totalCount: number;
  }> {
    // Wire-format → structured at the converter boundary so the
    // repository never sees the GraphQL cursor string. A null result
    // (garbage / stale cursor) collapses to "no cursor"; the repo
    // falls back to a clean first-page scan.
    const cursor = params.cursor
      ? ReportConverter.decodeCommunitySummaryCursor(params.cursor)
      : null;
    return this.repository.findCommunityReportSummary(ctx, {
      cursor,
      first: params.first,
    });
  }

  /**
   * A-3 maintenance helper. Re-derives the community's
   * `last_published_report_*` pointer from `t_reports`. Must be called
   * inside the same transaction as the report-side update (publish or
   * supersede) so the pointer cannot be observed mid-flight by a
   * concurrent `adminReportSummary` reader.
   *
   * Idempotent: invoking it twice in a row is a no-op the second time.
   * No "don't overwrite if older" semantics — the SELECT inside the
   * repository always picks the current newest PUBLISHED row.
   */
  async recalculateCommunityLastPublished(
    ctx: IContext,
    communityId: string,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    return this.repository.recalculateCommunityLastPublished(ctx, communityId, tx);
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
   * Persist judge results onto an existing Report row. Wraps the
   * repository call so the judge wiring in the usecase has a single
   * service-shaped seam to mock in unit tests, mirroring the rest of
   * the report domain.
   */
  async saveJudgeResult(
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
    return this.repository.updateReportJudgeResult(ctx, id, data, tx);
  }

  async getGoldenCases(
    ctx: IContext,
    options: { variant?: string; pinnedVersion?: number | null } = {},
  ): Promise<PrismaReportGoldenCase[]> {
    return this.repository.findGoldenCases(ctx, options);
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
