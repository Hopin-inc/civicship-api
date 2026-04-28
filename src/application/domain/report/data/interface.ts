import { Prisma, ReportStatus, ReportTemplateKind } from "@prisma/client";
import { IContext } from "@/types/server";
import {
  CommunitySummaryCursor,
  PrismaReport,
  PrismaReportGoldenCase,
  PrismaReportTemplate,
} from "@/application/domain/report/data/type";
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
  UserTransactionDailyRow,
} from "@/application/domain/report/data/rows";

// Re-export Row types so existing importers via
// `@/application/domain/report/data/interface` resolve unchanged.
// Direct imports from the rows module land in callers below as part
// of this commit; the re-exports stay so external consumers (none
// today, defensive) continue to work.
export type {
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
  UserTransactionDailyRow,
};

export interface IReportRepository {
  findDailySummaries(
    ctx: IContext,
    communityId: string,
    range: DateRange,
  ): Promise<TransactionSummaryDailyRow[]>;

  findDailyActiveUsers(
    ctx: IContext,
    communityId: string,
    range: DateRange,
  ): Promise<TransactionActiveUsersDailyRow[]>;

  findTopUsersByTotalPoints(
    ctx: IContext,
    communityId: string,
    range: DateRange,
    topN: number,
  ): Promise<UserTransactionAggregateRow[]>;

  /**
   * Per-user distinct counterparty count across the whole reporting window,
   * for the supplied user ids. Sourced from `t_transactions` directly rather
   * than MVs so distinct is a true set-cardinality over the period, not a
   * per-day sum. Scoped to the caller-supplied ids (the top-N result) so the
   * scan stays bounded regardless of community size.
   *
   * Returns a Map<userId, count> so the presenter's lookup is O(1) and
   * users with no outgoing activity simply miss the map (no row shipped from
   * SQL), letting the payload record them as `null` rather than `0`.
   */
  findTrueUniqueCounterpartiesForUsers(
    ctx: IContext,
    communityId: string,
    range: DateRange,
    userIds: string[],
  ): Promise<Map<string, number>>;

  findCommentsByDateRange(
    ctx: IContext,
    communityId: string,
    range: DateRange,
    limit?: number,
  ): Promise<TransactionCommentRow[]>;

  findUserProfiles(
    ctx: IContext,
    communityId: string,
    userIds: string[],
  ): Promise<UserProfileForReportRow[]>;

  findCommunityContext(
    ctx: IContext,
    communityId: string,
    range: DateRange,
  ): Promise<CommunityContextRow | null>;

  findDeepestChain(
    ctx: IContext,
    communityId: string,
    range: DateRange,
  ): Promise<DeepestChainRow | null>;

  /**
   * Aggregate the headline counters (active users, tx count, points volume,
   * new memberships) for an arbitrary window. Called twice when the usecase
   * opts into previous-period comparison: once for the current period (not
   * wired up yet — current-period stats are still derived from the other
   * repository calls so we don't double-scan) and once for the window
   * immediately preceding it. The shared method keeps the two calls on the
   * same SQL, so growth-rate math cannot drift.
   */
  findPeriodAggregate(
    ctx: IContext,
    communityId: string,
    range: DateRange,
  ): Promise<PeriodAggregateRow>;

  /**
   * Week-over-week retention signal counts for `[currentWeekStart,
   * nextWeekStart)`, using the week immediately before as the "prev" frame
   * and a bounded 12-week lookback for the "returned" frame. JST week
   * boundaries are caller-supplied as half-open UTC dates matching the MV
   * bucketing (e.g. Monday 00:00 JST). `is_sender` is defined as "had a
   * DONATION transaction out that day" (donation_out_count > 0 in
   * mv_user_transaction_daily) — the same definition is applied both
   * sides of the self-join so retained/returned/churned stay consistent.
   */
  findRetentionAggregate(
    ctx: IContext,
    communityId: string,
    range: {
      currentWeekStart: Date;
      nextWeekStart: Date;
      prevWeekStart: Date;
      twelveWeeksAgo: Date;
    },
  ): Promise<RetentionAggregateRow>;

  /**
   * Week-N retention: fraction of a cohort (joined during
   * `[cohortStart, cohortEnd)`) that was an `is_sender` in the window
   * `[activeStart, activeEnd)`. Returning numerator / denominator lets
   * the presenter emit null for empty cohorts without the repository
   * caring about display-layer concerns.
   */
  findCohortRetention(
    ctx: IContext,
    communityId: string,
    cohort: { cohortStart: Date; cohortEnd: Date },
    active: { activeStart: Date; activeEnd: Date },
  ): Promise<CohortRetentionRow>;

  refreshTransactionSummaryDaily(ctx: IContext, tx: Prisma.TransactionClient): Promise<void>;
  refreshUserTransactionDaily(ctx: IContext, tx: Prisma.TransactionClient): Promise<void>;

  findTemplate(
    ctx: IContext,
    variant: string,
    communityId: string | null,
  ): Promise<PrismaReportTemplate | null>;

  /**
   * CI-only direct lookup by (variant, kind, version, communityId).
   *
   * Deliberately bypasses the `isEnabled` / `isActive` filters used by
   * `findTemplate` and `findActiveTemplates` — the Golden Case harness
   * (`scripts/ci/run-golden-cases.ts`) must be able to grade a template
   * that is pinned to `isActive=false` during the v2 shakeout window
   * (PR-F5 §7). Production code paths must NOT call this; use
   * `ReportTemplateSelector.selectTemplate` instead, which respects the
   * active/enabled gates and the weighted A/B draw.
   */
  findTemplateByVersion(
    ctx: IContext,
    variant: string,
    kind: ReportTemplateKind,
    version: number,
    communityId: string | null,
  ): Promise<PrismaReportTemplate | null>;

  /**
   * Resolve every active candidate template for a given
   * (variant, kind, communityId) triple. Scoped strictly to the
   * `communityId` argument — SYSTEM fallback is the caller's job, so the
   * selector can tell "community has its own overrides" apart from
   * "community falls back to SYSTEM". Only `isEnabled=true AND
   * isActive=true` rows are returned, ordered by `id` for a stable draw
   * in the weighted selection.
   */
  findActiveTemplates(
    ctx: IContext,
    variant: string,
    kind: ReportTemplateKind,
    communityId: string | null,
  ): Promise<PrismaReportTemplate[]>;

  /**
   * Admin-facing template list for the Phase 1 management UI. Returns
   * every (variant, kind) row sorted version-DESC so the screen can show
   * v3 → v2 → v1 side by side, including the SYSTEM fallback when a
   * `communityId` is provided. Behaviour vs. the existing methods:
   *
   *   - `findActiveTemplates` (selector hot path): scoped strictly to
   *     `communityId` and forces `isEnabled=true AND isActive=true`.
   *     Used at generation time, not by admin UI.
   *   - `findTemplate` (single live row): admin's previous single-row
   *     accessor; returns the newest active row only.
   *   - `findTemplates` (this method): returns multiple rows, optionally
   *     including disabled / inactive ones, with SYSTEM ∪ COMMUNITY
   *     union when `communityId` is provided.
   *
   * `kind` is a parameter (not hardcoded) so the same query can power
   * both the GENERATION main tab and the JUDGE settings screen. The
   * usecase surface defaults `kind` to GENERATION; callers asking for
   * JUDGE rows are routed through the same path.
   */
  findTemplates(
    ctx: IContext,
    variant: string,
    communityId: string | null,
    kind: ReportTemplateKind,
    includeInactive: boolean,
  ): Promise<PrismaReportTemplate[]>;

  /**
   * Resolve the active SYSTEM-scope JUDGE template for a variant. Returns
   * null when no such template exists — callers must treat that as a
   * "skip the judge step" signal rather than failing the generation.
   * COMMUNITY-scope JUDGE templates are intentionally not seeded; the
   * runtime guard in the usecase rejects them so per-community judge
   * customisation does not silently land here.
   */
  findJudgeTemplate(
    ctx: IContext,
    variant: string,
  ): Promise<PrismaReportTemplate | null>;

  updateReportJudgeResult(
    ctx: IContext,
    id: string,
    data: {
      judgeScore: number | null;
      judgeBreakdown: Prisma.InputJsonValue | null;
      judgeTemplateId: string | null;
      coverageJson: Prisma.InputJsonValue | null;
    },
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaReport>;

  findGoldenCases(
    ctx: IContext,
    options?: { variant?: string; pinnedVersion?: number | null },
  ): Promise<PrismaReportGoldenCase[]>;

  upsertGoldenCase(
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
      templateVersion?: number | null;
    },
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaReportGoldenCase>;

  /**
   * Phase 2 sysAdmin: cross-community report search backing
   * `adminBrowseReports`. `findReports` is community-scoped and
   * permission-gated; this variant accepts an optional communityId
   * and goes through `ctx.issuer.internal` so the IsAdmin GraphQL
   * directive is the sole gatekeeper. Sort is `publishedAt DESC NULLS
   * LAST, createdAt DESC` so DRAFT / SKIPPED rows (no publishedAt)
   * never lead the page.
   */
  findAllReports(
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
  ): Promise<{ items: PrismaReport[]; totalCount: number }>;

  /**
   * Phase 2 sysAdmin: per-community last-publish summary for the L1
   * dashboard. Reads the denormalized `last_published_report_at` /
   * `last_published_report_id` columns on `t_communities` (maintained
   * by `recalculateCommunityLastPublished` below), so the sort and
   * cursor stay stable without a per-community subquery on every page.
   *
   * `publishedCountLast90Days` is computed inline (no denormalize) —
   * it changes too often for a stored column and the count over
   * `(community_id, status, published_at)` is index-friendly.
   *
   * Returned rows carry the `lastPublishedReportId` / `lastPublishedAt`
   * pair plus the count; the resolver hydrates `community` /
   * `lastPublishedReport` via dataloaders so a 50-row page costs at
   * most two batched lookups.
   */
  findCommunityReportSummary(
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
  }>;

  /**
   * Re-compute and persist the `t_communities.last_published_report_*`
   * pointer for a community. Picks the newest `status=PUBLISHED` report
   * (or NULL if none remain). Called from two places, both inside the
   * same transaction as the report-side update:
   *
   *   1. `publishReport` after a transition into PUBLISHED so the
   *      pointer always reflects the freshly-published report.
   *   2. `supersedeParentIfRegenerating` after a PUBLISHED → SUPERSEDED
   *      transition so a regenerated run does not leave the pointer
   *      stranded on a no-longer-published row.
   *
   * Always re-derives from `t_reports`; no need for callers to thread
   * a publishedAt comparison ("don't overwrite if older") because the
   * SELECT itself picks the newest remaining PUBLISHED row.
   */
  recalculateCommunityLastPublished(
    ctx: IContext,
    communityId: string,
    tx: Prisma.TransactionClient,
  ): Promise<void>;

  upsertTemplate(
    ctx: IContext,
    variant: string,
    communityId: string | null,
    data: Omit<Prisma.ReportTemplateCreateInput, "variant" | "scope" | "community">,
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaReportTemplate>;

  createReport(
    ctx: IContext,
    data: Prisma.ReportUncheckedCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaReport>;

  findReportById(ctx: IContext, id: string, tx?: Prisma.TransactionClient): Promise<PrismaReport | null>;

  findReports(
    ctx: IContext,
    params: {
      communityId: string;
      variant?: string;
      status?: ReportStatus;
      cursor?: string;
      first?: number;
    },
  ): Promise<{ items: PrismaReport[]; totalCount: number }>;

  updateReportStatus(
    ctx: IContext,
    id: string,
    status: ReportStatus,
    extra?: {
      publishedAt?: Date;
      publishedBy?: string;
      finalContent?: string;
    },
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaReport>;

  findReportsByParentRunId(ctx: IContext, parentRunIds: string[]): Promise<PrismaReport[]>;
}
