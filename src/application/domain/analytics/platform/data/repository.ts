import { injectable } from "tsyringe";
import { IContext } from "@/types/server";
import { IAnalyticsPlatformRepository } from "@/application/domain/analytics/platform/data/interface";
import { AnalyticsPlatformTotalsRow } from "@/application/domain/analytics/platform/data/type";

@injectable()
export default class AnalyticsPlatformRepository implements IAnalyticsPlatformRepository {
  async findPlatformTotals(
    ctx: IContext,
    jstMonthStart: Date,
    jstNextMonthStart: Date,
  ): Promise<AnalyticsPlatformTotalsRow> {
    return ctx.issuer.public(ctx, async (tx) => {
      const rows = await tx.$queryRaw<
        {
          communities_count: number;
          total_members: number;
          latest_month_donation_points: bigint;
        }[]
      >`
        WITH comm AS (
          SELECT COUNT(*)::int AS n FROM "t_communities"
        ),
        members AS (
          SELECT COUNT(*)::int AS n
          FROM "t_memberships"
          WHERE "status" = 'JOINED'
            AND "created_at" <  (${jstNextMonthStart}::date AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
        ),
        donations AS (
          SELECT COALESCE(SUM("points_sum"), 0)::bigint AS n
          FROM "mv_transaction_summary_daily"
          WHERE "date" >= ${jstMonthStart}::date
            AND "date" <  ${jstNextMonthStart}::date
            AND "reason" = 'DONATION'
        )
        SELECT
          comm.n AS communities_count,
          members.n AS total_members,
          donations.n AS latest_month_donation_points
        FROM comm, members, donations
      `;
      const r = rows[0];
      return {
        communitiesCount: r.communities_count,
        totalMembers: r.total_members,
        latestMonthDonationPoints: r.latest_month_donation_points,
      };
    });
  }
}
