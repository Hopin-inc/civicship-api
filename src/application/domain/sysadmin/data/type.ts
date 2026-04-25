/**
 * Row shapes returned by SysAdminRepository to the service layer.
 *
 * All numeric counts are already `number` (the repository `::int`-casts
 * them on the SQL side so Prisma doesn't surface bigints for count
 * outputs). Monetary / volume fields stay as `bigint` and the presenter
 * layer is responsible for running them through `bigintToSafeNumber`.
 */

export type SysAdminCommunityRow = {
  communityId: string;
  communityName: string;
};

/**
 * One member of a community with derived LTV-variable counters at the
 * given `asOf` timestamp. `userSendRate` is `donationOutMonths /
 * monthsIn` rounded to 3 decimals by the SQL.
 *
 * `name` is nullable to handle race conditions (member row without a
 * user row shouldn't normally happen but keeps the type honest).
 */
export type SysAdminMemberStatsRow = {
  userId: string;
  name: string | null;
  monthsIn: number;
  donationOutMonths: number;
  totalPointsOut: bigint;
  userSendRate: number;
};

/** Monthly activity counters, sourced from `mv_*` + `t_memberships`.
 *
 * `donationTxCount` / `donationChainTxCount` are bigint because the
 * underlying SUM can exceed int32 on long-running communities (the
 * per-day `tx_count` column is int32 but cumulative window sums
 * could legitimately hit 2B+). The presenter layer converts through
 * `bigintToSafeNumber` before the value leaves the domain.
 */
export type SysAdminMonthlyActivityRow = {
  /** JST month start (UTC-encoded, first day of the month at 00:00). */
  monthStart: Date;
  senderCount: number;
  totalMembersEndOfMonth: number;
  newMembers: number;
  donationPointsSum: bigint;
  donationTxCount: bigint;
  donationChainTxCount: bigint;
};

/** All-time totals for the summary card, keyed by community. */
export type SysAdminAllTimeTotalsRow = {
  totalDonationPoints: bigint;
  maxChainDepth: number | null;
  dataFrom: Date | null;
  dataTo: Date | null;
};

/** Latest-month activity snapshot used by the L1 dashboard + summary card. */
export type SysAdminActivitySnapshotRow = {
  senderCount: number;
  totalMembers: number;
};

/** New-member count within an arbitrary window (used for `no_new_members`). */
export type SysAdminNewMemberCountRow = {
  count: number;
};

/**
 * Count of unique users who sent at least one DONATION in BOTH of two
 * supplied windows (set intersection on user_id). Powers
 * `SysAdminWindowActivity.retainedSenders` so the client can derive
 * window-scale activity flow (newly activated vs. churned) without
 * a second round-trip.
 */
export type SysAdminRetainedSenderCountRow = {
  count: number;
};

/**
 * Platform-wide totals for the L1 dashboard header. Derived in one CTE
 * query rather than summing per-community payloads in memory so the
 * answer stays atomic with a single asOf timestamp.
 */
export type SysAdminPlatformTotalsRow = {
  communitiesCount: number;
  totalMembers: number;
  latestMonthDonationPoints: bigint;
};
