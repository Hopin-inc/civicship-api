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

  findUserAggregatedInRange(
    ctx: IContext,
    communityId: string,
    range: DateRange,
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

  refreshTransactionSummaryDaily(ctx: IContext, tx: Prisma.TransactionClient): Promise<void>;
  refreshUserTransactionDaily(ctx: IContext, tx: Prisma.TransactionClient): Promise<void>;
}
