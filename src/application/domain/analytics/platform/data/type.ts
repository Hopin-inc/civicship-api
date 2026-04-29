/**
 * Platform-wide totals for the analytics dashboard header. Derived in
 * one CTE query rather than summing per-community payloads in memory
 * so the answer stays atomic with a single asOf timestamp.
 */
export type AnalyticsPlatformTotalsRow = {
  communitiesCount: number;
  totalMembers: number;
  latestMonthDonationPoints: bigint;
};
