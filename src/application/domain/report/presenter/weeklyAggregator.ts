import {
  CohortRetentionRow,
  PeriodAggregateRow,
  RetentionAggregateRow,
  TransactionSummaryDailyRow,
} from "@/application/domain/report/data/rows";
import {
  PreviousPeriodSummary,
  RetentionSummary,
} from "@/application/domain/report/types";
import { bigintToSafeNumber, percentChange } from "@/application/domain/report/util";

/**
 * Sum the daily summary rows into the window's tx count and points
 * total. Accumulates the BigInt sums before narrowing so the
 * safe-integer guard runs against the TOTAL rather than each reason
 * row — narrowing per row and then summing as Number would let a
 * total that exceeds Number.MAX_SAFE_INTEGER slip through silently
 * even when each individual row is safe.
 */
export function aggregateTransactionTotals(summaries: TransactionSummaryDailyRow[]): {
  txCount: number;
  pointsSum: number;
} {
  const txCount = summaries.reduce((acc, s) => acc + s.txCount, 0);
  const pointsSumBigInt = summaries.reduce((acc, s) => acc + s.pointsSum, 0n);
  return { txCount, pointsSum: bigintToSafeNumber(pointsSumBigInt) };
}

/**
 * Per-row average chain depth for `daily_summaries`. `chain_depth` is
 * NULL for non-chain reasons (POINT_ISSUED / TICKET_* / OPPORTUNITY_*)
 * and can also be NULL on chain-eligible reasons when no parent tx was
 * found upstream. Divide by the count of rows that actually carry a
 * chain_depth (root + descendant), not by the full tx_count, since
 * SUM(chain_depth) in SQL skips NULL rows.
 */
export function computeAvgChainDepth(s: TransactionSummaryDailyRow): number | null {
  if (s.maxChainDepth === null) return null;
  const denom = s.chainRootCount + s.chainDescendantCount;
  if (denom === 0) return null;
  return s.sumChainDepth / denom;
}

/**
 * Compute the retention summary block from the pre-fetched aggregate +
 * cohort rows. `null` total members collapses the rate fields to null
 * (rather than leaking divide-by-zero or a bogus "100%" from using the
 * aggregate's own counts as the denominator). Week-N rows with
 * cohortSize === 0 also collapse to null so the LLM doesn't report
 * "0% retention" for a cohort that never existed.
 */
export function computeRetentionSummary(retention: {
  aggregate: RetentionAggregateRow;
  totalMembers: number | null;
  week1: CohortRetentionRow | null;
  week4: CohortRetentionRow | null;
}): RetentionSummary {
  const denom = retention.totalMembers !== null && retention.totalMembers > 0
    ? retention.totalMembers
    : null;
  return {
    new_members: retention.aggregate.newMembers,
    retained_senders: retention.aggregate.retainedSenders,
    returned_senders: retention.aggregate.returnedSenders,
    churned_senders: retention.aggregate.churnedSenders,
    active_rate_sender:
      denom !== null ? retention.aggregate.currentSendersCount / denom : null,
    active_rate_any:
      denom !== null ? retention.aggregate.currentActiveCount / denom : null,
    week1_retention:
      retention.week1 && retention.week1.cohortSize > 0
        ? retention.week1.activeNextWeek / retention.week1.cohortSize
        : null,
    week4_retention:
      retention.week4 && retention.week4.cohortSize > 0
        ? retention.week4.activeNextWeek / retention.week4.cohortSize
        : null,
  };
}

/**
 * Compute the previous-period growth-rate sub-object.
 *
 * `active_users` collapses to null when `hasCommunityContext` is false
 * (missing / soft-deleted community): without a current-window
 * denominator that uses the same DONATION-scope frame as the
 * previous-window `activeUsersInWindow`, any percent-change we could
 * compute here would be a scale-mismatched comparison (e.g.
 * retention-derived narrow vs period-aggregate broad) and would
 * mis-report the trend. `tx_count` / `points_sum` are safe because
 * the current-window numerators derive from the already-passed daily
 * summaries — no dependency on the community context row.
 */
export function computeGrowthRates(args: {
  currentTxCount: number;
  currentPointsSum: number;
  currentActiveUsers: number;
  hasCommunityContext: boolean;
  previousAggregate: PeriodAggregateRow;
}): PreviousPeriodSummary["growth_rate"] {
  return {
    active_users: args.hasCommunityContext
      ? percentChange(args.currentActiveUsers, args.previousAggregate.activeUsersInWindow)
      : null,
    tx_count: percentChange(args.currentTxCount, args.previousAggregate.totalTxCount),
    points_sum: percentChange(
      args.currentPointsSum,
      bigintToSafeNumber(args.previousAggregate.totalPointsSum),
    ),
  };
}

/**
 * Connection-shaped pagination: peek at one extra row to detect
 * `hasNextPage`, then truncate. Both `reportsConnection` and
 * `adminReportSummaryConnection` follow this convention so the helper
 * keeps the slice math in one place.
 */
export function computePageInfo<T>(
  items: T[],
  requestedFirst: number,
): { hasNextPage: boolean; page: T[] } {
  const hasNextPage = items.length > requestedFirst;
  const page = hasNextPage ? items.slice(0, requestedFirst) : items;
  return { hasNextPage, page };
}

/**
 * Days between `lastPublishedAt` and `now` at JST day grain. Returns
 * `null` for never-published communities so the UI can render "—"
 * instead of "0 days" (which would suggest a recent publish).
 */
export function computeDaysSinceLastPublish(
  lastPublishedAt: Date | null,
  now: number,
): number | null {
  if (!lastPublishedAt) return null;
  const millisPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((now - lastPublishedAt.getTime()) / millisPerDay);
}

/**
 * Active-rate computation for `community_context.active_rate`. Treats
 * a totalMembers ≤ 0 community as null rather than 0% — divide-by-zero
 * would surface as Infinity, and a non-positive denominator means the
 * rate is undefined rather than zero.
 */
export function computeActiveRate(activeUsers: number, totalMembers: number): number | null {
  return totalMembers > 0 ? activeUsers / totalMembers : null;
}
