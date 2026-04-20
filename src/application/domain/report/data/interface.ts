import {
  Prisma,
  TransactionReason,
  Role,
  ReportStatus,
  ReportTemplateKind,
} from "@prisma/client";
import { IContext } from "@/types/server";
import {
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
 * multiple days). Paired with `totalMembers` it lets the presenter emit an
 * `active_rate` without a second round trip.
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
