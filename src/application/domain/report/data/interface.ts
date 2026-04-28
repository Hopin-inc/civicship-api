import {
  Prisma,
  TransactionReason,
  Role,
  ReportStatus,
  ReportTemplateKind,
} from "@prisma/client";
import { IContext } from "@/types/server";
import {
  CommunitySummaryCursor,
  PrismaReport,
  PrismaReportGoldenCase,
  PrismaReportTemplate,
} from "@/application/domain/report/data/type";

export interface TransactionSummaryDailyRow {
  date: Date;
  communityId: string;
  reason: TransactionReason;
  txCount: number;
  pointsSum: bigint;
  chainRootCount: number;
  chainDescendantCount: number;
  maxChainDepth: number | null;
  sumChainDepth: number;
  issuanceCount: number;
  burnCount: number;
}

/**
 * Per-day distinct user counts for a single community, DONATION-scoped to
 * match the `is_sender` / `is_receiver` frame used by the retention
 * aggregate: `senders` counts users with `donation_out_count > 0` that
 * day, `receivers` counts users with `received_donation_count > 0`, and
 * `activeUsers` is the union (DISTINCT user_id matching either). Users
 * whose only activity was receiving an admin-issued ONBOARDING / GRANT
 * transaction are intentionally excluded.
 */
export interface TransactionActiveUsersDailyRow {
  date: Date;
  communityId: string;
  activeUsers: number;
  senders: number;
  receivers: number;
}

export interface UserTransactionDailyRow {
  date: Date;
  communityId: string;
  userId: string;
  walletId: string;
  txCountIn: number;
  txCountOut: number;
  pointsIn: bigint;
  pointsOut: bigint;
  donationOutCount: number;
  donationOutPoints: bigint;
  receivedDonationCount: number;
  chainRootCount: number;
  maxChainDepthStarted: number | null;
  chainDepthReachedMax: number | null;
  uniqueCounterparties: number;
}

/**
 * Per-user aggregate across the reporting window, produced via Prisma
 * `groupBy` on UserTransactionDailyView in the repository. BigInt sums come
 * through unchanged from the aggregate; the presenter converts them via the
 * safe-integer guard at the payload boundary.
 */
export interface UserTransactionAggregateRow {
  userId: string;
  txCountIn: number;
  txCountOut: number;
  pointsIn: bigint;
  pointsOut: bigint;
  donationOutCount: number;
  donationOutPoints: bigint;
  receivedDonationCount: number;
  chainRootCount: number;
  maxChainDepthStarted: number | null;
  chainDepthReachedMax: number | null;
  uniqueCounterpartiesSum: number;
}

export interface TransactionCommentRow {
  transactionId: string;
  date: Date;
  createdAt: Date;
  communityId: string;
  fromUserId: string | null;
  toUserId: string | null;
  createdByUserId: string | null;
  reason: TransactionReason;
  points: number;
  comment: string;
  chainDepth: number | null;
}

export interface UserProfileForReportRow {
  userId: string;
  communityId: string;
  name: string;
  userBio: string | null;
  membershipBio: string | null;
  headline: string | null;
  role: Role;
  joinedAt: Date;
}

/**
 * Per-community metadata needed to contextualise the AI report: identity /
 * naming, headline bio + website + established date, total member count, and
 * the distinct active-user count within the reporting window. Shaped for a
 * single LLM payload block, not a generic community read model.
 *
 * `activeUsersInWindow` is a *distinct* count across the range (not the
 * sum of per-day active-user counts, which over-counts users active on
 * multiple days) and DONATION-scoped to match the retention frame — only
 * users with `donation_out_count > 0` or `received_donation_count > 0` on
 * at least one day in the window are counted. Paired with `totalMembers`
 * it lets the presenter emit a peer-to-peer `active_rate` without a
 * second round trip and without being inflated by system-issued
 * ONBOARDING / GRANT transactions.
 */
export interface CommunityContextRow {
  communityId: string;
  name: string;
  pointName: string;
  bio: string | null;
  establishedAt: Date | null;
  website: string | null;
  totalMembers: number;
  activeUsersInWindow: number;
}

/**
 * Single deepest transaction-chain reached within the reporting window, used
 * by the report as a qualitative highlight ("how far did a single point
 * travel?"). `chainDepth` is guaranteed non-null by the filter. `date` is
 * the JST calendar day bucket matching the report window boundaries.
 */
export interface DeepestChainRow {
  transactionId: string;
  chainDepth: number;
  reason: TransactionReason;
  comment: string | null;
  date: Date;
  fromUserId: string | null;
  toUserId: string | null;
  createdByUserId: string | null;
  parentTxId: string | null;
}

export interface DateRange {
  from: Date;
  to: Date;
}

/**
 * Aggregate counters for a single window, shaped to back the
 * `PreviousPeriodSummary` payload block. `totalPointsSum` is a BigInt at the
 * boundary so the presenter can funnel it through the same safe-integer
 * guard used elsewhere — the underlying SUM over `mv_transaction_summary_daily`
 * returns `bigint` and we preserve precision until the payload boundary.
 *
 * `activeUsersInWindow` uses the same DONATION-scoped definition as
 * `CommunityContextRow.activeUsersInWindow` so the presenter's
 * `growth_rate.active_users` (current vs previous window) compares on a
 * consistent frame; a broad `COUNT DISTINCT` here would silently make
 * week-over-week engagement changes look smaller than they are.
 */
export interface PeriodAggregateRow {
  activeUsersInWindow: number;
  totalTxCount: number;
  totalPointsSum: bigint;
  newMembers: number;
}

/**
 * Per-user "was active as a sender this week" / "was active last week" /
 * "is a new member" flags aggregated across the community for a single
 * reporting window. The repository returns the raw counts so the
 * presenter can divide through `total_members` without the repo needing
 * to know about the community-context lookup.
 */
export interface RetentionAggregateRow {
  newMembers: number;
  retainedSenders: number;
  returnedSenders: number;
  churnedSenders: number;
  currentSendersCount: number;
  currentActiveCount: number;
}

/**
 * Week-N retention for a single cohort: numerator / denominator kept raw
 * so the presenter can emit `null` when the denominator is zero (no
 * cohort yet) and the prompt template sees a clear "no signal" signal.
 */
export interface CohortRetentionRow {
  cohortSize: number;
  activeNextWeek: number;
}

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
