import {
  TransactionActiveUsersDailyRow,
  TransactionCommentRow,
  TransactionSummaryDailyRow,
  UserProfileForReportRow,
  UserTransactionAggregateRow,
} from "@/application/domain/report/data/interface";
import {
  bigintToSafeNumber,
  daysBetweenJst,
  toJstIsoDate,
} from "@/application/domain/report/util";

// ---------------------------------------------------------------------------
// AI-facing report payload types
//
// These are plain, JSON-serialisable shapes designed to be fed to an LLM as
// the dataset for report generation. Keep keys snake_case for LLM-friendly
// token boundaries, and convert BigInt to number (safe: point amounts fit
// well inside Number.MAX_SAFE_INTEGER for our scale).
// ---------------------------------------------------------------------------

export interface WeeklyReportPayload {
  period: { from: string; to: string };
  community_id: string;
  daily_summaries: DailySummaryItem[];
  daily_active_users: DailyActiveUsersItem[];
  top_users: TopUserItem[];
  highlight_comments: CommentItem[];
}

export interface DailySummaryItem {
  date: string;
  reason: string;
  tx_count: number;
  points_sum: number;
  chain_root_count: number;
  chain_descendant_count: number;
  max_chain_depth: number | null;
  avg_chain_depth: number | null;
  issuance_count: number;
  burn_count: number;
}

export interface DailyActiveUsersItem {
  date: string;
  active_users: number;
  senders: number;
  receivers: number;
}

export interface TopUserItem {
  user_id: string;
  name: string;
  user_bio: string | null;
  membership_bio: string | null;
  headline: string | null;
  role: string;
  joined_at: string;
  days_since_joined: number;
  tx_count_in: number;
  tx_count_out: number;
  points_in: number;
  points_out: number;
  donation_out_count: number;
  donation_out_points: number;
  received_donation_count: number;
  chain_root_count: number;
  max_chain_depth_started: number | null;
  chain_depth_reached_max: number | null;
  /**
   * Sum of per-day distinct counterparty counts across the reporting window.
   * NOT a deduplicated count of distinct counterparties for the period — the
   * same counterparty appearing on multiple days is counted once per day.
   */
  unique_counterparties_sum: number;
}

export interface CommentItem {
  transaction_id: string;
  date: string;
  reason: string;
  points: number;
  comment: string;
  from_user_id: string | null;
  to_user_id: string | null;
  created_by_user_id: string | null;
  chain_depth: number | null;
}

export default class ReportPresenter {
  static weeklyPayload(input: {
    communityId: string;
    range: { from: Date; to: Date };
    referenceDate: Date;
    summaries: TransactionSummaryDailyRow[];
    activeUsers: TransactionActiveUsersDailyRow[];
    userAggregates: UserTransactionAggregateRow[];
    profiles: UserProfileForReportRow[];
    comments: TransactionCommentRow[];
    topN?: number;
  }): WeeklyReportPayload {
    const topN = input.topN ?? 10;
    const profileByUserId = new Map(input.profiles.map((p) => [p.userId, p]));

    // Period-level aggregation is done in SQL via groupBy; sort+slice the
    // result here to pick the top N users by total activity.
    const topUsers: TopUserItem[] = [...input.userAggregates]
      .sort((a, b) => {
        const totalB = bigintToSafeNumber(b.pointsIn) + bigintToSafeNumber(b.pointsOut);
        const totalA = bigintToSafeNumber(a.pointsIn) + bigintToSafeNumber(a.pointsOut);
        return totalB - totalA;
      })
      .slice(0, topN)
      .map((u) => {
        const p = profileByUserId.get(u.userId);
        return {
          user_id: u.userId,
          name: p?.name ?? "",
          user_bio: p?.userBio ?? null,
          membership_bio: p?.membershipBio ?? null,
          headline: p?.headline ?? null,
          role: p?.role ?? "MEMBER",
          joined_at: p ? toJstIsoDate(p.joinedAt) : "",
          days_since_joined: p ? daysBetweenJst(p.joinedAt, input.referenceDate) : 0,
          tx_count_in: u.txCountIn,
          tx_count_out: u.txCountOut,
          points_in: bigintToSafeNumber(u.pointsIn),
          points_out: bigintToSafeNumber(u.pointsOut),
          donation_out_count: u.donationOutCount,
          donation_out_points: bigintToSafeNumber(u.donationOutPoints),
          received_donation_count: u.receivedDonationCount,
          chain_root_count: u.chainRootCount,
          max_chain_depth_started: u.maxChainDepthStarted,
          chain_depth_reached_max: u.chainDepthReachedMax,
          unique_counterparties_sum: u.uniqueCounterpartiesSum,
        };
      });

    return {
      period: {
        from: toJstIsoDate(input.range.from),
        to: toJstIsoDate(input.range.to),
      },
      community_id: input.communityId,
      daily_summaries: input.summaries.map((s) => ({
        date: toJstIsoDate(s.date),
        reason: s.reason,
        tx_count: s.txCount,
        points_sum: bigintToSafeNumber(s.pointsSum),
        chain_root_count: s.chainRootCount,
        chain_descendant_count: s.chainDescendantCount,
        max_chain_depth: s.maxChainDepth,
        // chain_depth is NULL for non-chain reasons (POINT_ISSUED / TICKET_* /
        // OPPORTUNITY_*) and can also be NULL on chain-eligible reasons when
        // no parent tx was found upstream. Divide by the count of rows that
        // actually carry a chain_depth (root + descendant), not by the full
        // tx_count, since SUM(chain_depth) in SQL skips NULL rows.
        avg_chain_depth:
          s.maxChainDepth !== null && s.chainRootCount + s.chainDescendantCount > 0
            ? s.sumChainDepth / (s.chainRootCount + s.chainDescendantCount)
            : null,
        issuance_count: s.issuanceCount,
        burn_count: s.burnCount,
      })),
      daily_active_users: input.activeUsers.map((u) => ({
        date: toJstIsoDate(u.date),
        active_users: u.activeUsers,
        senders: u.senders,
        receivers: u.receivers,
      })),
      top_users: topUsers,
      highlight_comments: input.comments.map((c) => ({
        transaction_id: c.transactionId,
        date: toJstIsoDate(c.date),
        reason: c.reason,
        points: c.points,
        comment: c.comment,
        from_user_id: c.fromUserId,
        to_user_id: c.toUserId,
        created_by_user_id: c.createdByUserId,
        chain_depth: c.chainDepth,
      })),
    };
  }
}
