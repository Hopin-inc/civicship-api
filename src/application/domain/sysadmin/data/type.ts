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
  uniqueDonationRecipients: number;
  daysIn: number;
  donationOutDays: number;
  /**
   * Receiver-side counterparts to the donation-out counters above.
   * Backs `SysAdminMemberRow.totalPointsIn` /
   * `donationInMonths` / `donationInDays` / `uniqueDonationSenders`
   * — see those field docs for scope details (DONATION reason
   * only, in-community sender wallets, sender wallets without a
   * user_id excluded, self-donations excluded). All four are 0 for
   * members who have never received a DONATION; this is the
   * receiver-side analogue of "latent" on the sender axis.
   */
  totalPointsIn: bigint;
  donationInMonths: number;
  donationInDays: number;
  uniqueDonationSenders: number;
  /**
   * The most recent JST calendar day the member sent a DONATION
   * (UTC-encoded date at JST midnight, same convention as the rest
   * of the sysadmin domain). null when the member has never
   * donated. Internal raw signal; not exposed in GraphQL today —
   * `dormantCount` is derived from it in the service layer.
   */
  lastDonationDay: Date | null;

  /**
   * The first JST calendar day the member sent a DONATION (same
   * UTC-encoded JST-midnight convention as `lastDonationDay`).
   * null when the member has never donated. Powers the cohort
   * funnel's `activatedD30` stage — a member is "activated within
   * 30 days" iff `firstDonationDay - joinedAt < 30 days`.
   */
  firstDonationDay: Date | null;

  /**
   * The member's `t_memberships.created_at` (UTC-encoded
   * timestamp WITHOUT time zone — same storage as the column).
   * Powers cohort bucketing in the service layer (the cohort
   * month is `DATE_TRUNC('month', joinedAt AT TIME ZONE 'UTC' AT
   * TIME ZONE 'Asia/Tokyo')`). Internal raw signal; not exposed
   * directly in GraphQL.
   */
  joinedAt: Date;
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
  /**
   * Members who had no DONATION out in the trailing 30 days as of
   * this month's END (the cutoff timestamp is `monthEnd` =
   * the JST first-of-next-month at 00:00). Always returned as a
   * non-negative count. Backs
   * `SysAdminMonthlyActivityPoint.dormantCount`.
   */
  dormantCountEndOfMonth: number;
  /**
   * Members who were dormant at the END of the PREVIOUS calendar
   * month (same 30-day-trailing definition as
   * `dormantCountEndOfMonth`) but had at least one DONATION out
   * during this month. null for the first month in the trend
   * series — there is no prior month-end snapshot to reference.
   * Backs `SysAdminMonthlyActivityPoint.returnedMembers`.
   */
  returnedMembers: number | null;
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
 * Window-scoped count of members classified as hubs. A member is a
 * hub if they sent DONATION to at least `hubBreadthThreshold` DISTINCT
 * counterparties during `[currLower, upper)` JST. Powers
 * `SysAdminCommunityOverview.hubMemberCount`.
 */
export type SysAdminHubMemberCountRow = {
  count: number;
};

/**
 * All five raw counts the L1 `SysAdminWindowActivity` payload needs,
 * derived from a single MV scan + a single membership scan over
 * `[prevLower, upper)`. Consolidates what used to be 3 overlapping
 * mv_user_transaction_daily reads (curr senders, prev senders,
 * intersection) and 2 overlapping t_memberships reads (curr/prev
 * new members) into one method so the dashboard load cost grows
 * linearly with community count instead of with a 5x multiplier.
 *
 * Field shape mirrors `WindowActivityCounts` so the service can
 * pass the row through without re-mapping.
 */
export type SysAdminWindowActivityCountsRow = {
  senderCount: number;
  senderCountPrev: number;
  retainedSenders: number;
  newMemberCount: number;
  newMemberCountPrev: number;
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

/**
 * One bucket of the all-time DONATION chain-depth histogram. Backs
 * `SysAdminCommunityDetailPayload.chainDepthDistribution`. The
 * repository emits a fixed-shape array (depth 1..N inclusive,
 * with the last bucket aggregating depth >= N) so the service
 * layer doesn't need to zero-pad.
 */
export type SysAdminChainDepthBucketRow = {
  depth: number;
  count: number;
};
