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

/** Monthly activity counters, sourced from `mv_*` + `t_memberships`. */
export type SysAdminMonthlyActivityRow = {
  /** JST month start (UTC-encoded, first day of the month at 00:00). */
  monthStart: Date;
  senderCount: number;
  totalMembersEndOfMonth: number;
  newMembers: number;
  donationPointsSum: bigint;
  donationTxCount: number;
  donationChainTxCount: number;
};

/** All-time totals for the summary card, keyed by community. */
export type SysAdminAllTimeTotalsRow = {
  totalDonationPoints: bigint;
  maxChainDepth: number | null;
  dataFrom: Date | null;
  dataTo: Date | null;
};

/** Latest-month activity snapshot used by the L1 dashboard + summary card. */
export type SysAdminMonthActivitySnapshotRow = {
  senderCount: number;
  totalMembers: number;
};

/** New-member count within an arbitrary window (used for `no_new_members`). */
export type SysAdminNewMemberCountRow = {
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
