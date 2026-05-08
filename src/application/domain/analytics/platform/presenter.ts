import { bigintToSafeNumber } from "@/application/domain/report/util";
import { GqlAnalyticsPlatformSummary } from "@/types/graphql";
import { AnalyticsPlatformTotalsRow } from "@/application/domain/analytics/platform/data/type";

/**
 * Pure shape mapper from raw SQL row to the GraphQL platform summary.
 * BigInt totals route through bigintToSafeNumber so an externally-
 * reported total throws loudly on overflow rather than silently
 * truncating.
 */
export default class AnalyticsPlatformPresenter {
  static platform(row: AnalyticsPlatformTotalsRow): GqlAnalyticsPlatformSummary {
    return {
      communitiesCount: row.communitiesCount,
      totalMembers: row.totalMembers,
      latestMonthDonationPoints: bigintToSafeNumber(row.latestMonthDonationPoints),
    };
  }
}
