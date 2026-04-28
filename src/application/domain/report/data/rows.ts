import { TransactionReason, Role } from "@prisma/client";

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
