import { Prisma, TransactionReason, Role } from "@prisma/client";
import { IContext } from "@/types/server";

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
}
