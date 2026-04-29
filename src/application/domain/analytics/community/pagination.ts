import { AnalyticsMemberStatsRow } from "@/application/domain/sysadmin/data/type";

export type SortField = "SEND_RATE" | "MONTHS_IN" | "DONATION_OUT_MONTHS" | "TOTAL_POINTS_OUT";
export type SortOrder = "ASC" | "DESC";

export type MemberListParams = {
  minSendRate?: number | null;
  maxSendRate?: number | null;
  minMonthsIn?: number | null;
  minDonationOutMonths?: number | null;
  sortField: SortField;
  sortOrder: SortOrder;
  limit: number;
  // Pre-decoded offset; the GraphQL → number wire-format step lives
  // in `SysAdminConverter.parseMemberListCursor` so the service
  // operates on internal form only.
  cursor?: number;
};

export type MemberListResult = {
  users: AnalyticsMemberStatsRow[];
  hasNextPage: boolean;
  // Internal form. The GraphQL `nextCursor: String | null` is built
  // by the presenter, which owns the internal → wire-format step.
  nextOffset: number | null;
};

/**
 * Member-list page-size cap. Raised from the historical 200 to 1000
 * so client-side aggregations that span the full membership (e.g.
 * the L2 "受領→送付 転換率" / recipient-to-sender conversion rate
 * derived from `AnalyticsMemberRow.uniqueDonationSenders` +
 * `totalPointsOut`) can pull a single page without N round-trips
 * for typical communities. Communities larger than 1000 members
 * still need cursor pagination — the cap exists to prevent a
 * malformed/hostile request from materialising the full member set
 * for an arbitrarily large community in one response.
 */
export const MAX_LIMIT = 1000;

/**
 * Filter + sort + page a pre-fetched member list. Pagination uses an
 * offset-encoded cursor (`"n"`) so the caller can resume from row N
 * without re-running the underlying aggregation. At <6 communities
 * with a few hundred members each, in-memory paging is cheaper than
 * a new SQL round-trip per page.
 */
export function paginateMembers(
  members: AnalyticsMemberStatsRow[],
  params: MemberListParams,
): MemberListResult {
  const filtered = members.filter((m) => {
    if (params.minSendRate != null && m.userSendRate < params.minSendRate) return false;
    if (params.maxSendRate != null && m.userSendRate > params.maxSendRate) return false;
    if (params.minMonthsIn != null && m.monthsIn < params.minMonthsIn) return false;
    if (params.minDonationOutMonths != null && m.donationOutMonths < params.minDonationOutMonths)
      return false;
    return true;
  });

  const sign = params.sortOrder === "ASC" ? 1 : -1;
  const numericKey = (m: AnalyticsMemberStatsRow): number => {
    switch (params.sortField) {
      case "SEND_RATE":
        return m.userSendRate;
      case "MONTHS_IN":
        return m.monthsIn;
      case "DONATION_OUT_MONTHS":
        return m.donationOutMonths;
      case "TOTAL_POINTS_OUT":
        // Handled in the bigint branch below; placeholder here so
        // the switch is exhaustive.
        return 0;
    }
  };
  const sorted = [...filtered].sort((a, b) => {
    let cmp: number;
    if (params.sortField === "TOTAL_POINTS_OUT") {
      // Compare bigints directly — Number(bigint) would silently
      // lose precision past Number.MAX_SAFE_INTEGER and quietly
      // mis-order the leaderboard for extreme donors.
      if (a.totalPointsOut < b.totalPointsOut) cmp = -1;
      else if (a.totalPointsOut > b.totalPointsOut) cmp = 1;
      else cmp = 0;
    } else {
      cmp = numericKey(a) - numericKey(b);
    }
    if (cmp !== 0) return sign * cmp;
    // Stable secondary sort on userId to make the cursor deterministic.
    return a.userId.localeCompare(b.userId);
  });

  const start = params.cursor ?? 0;
  const limit = Math.min(Math.max(params.limit, 1), MAX_LIMIT);
  const page = sorted.slice(start, start + limit);
  const hasNextPage = start + limit < sorted.length;
  return {
    users: page,
    hasNextPage,
    nextOffset: hasNextPage ? start + limit : null,
  };
}
