import { injectable } from "tsyringe";
import { IContext } from "@/types/server";
import {
  SysAdminAllTimeTotalsRow,
  SysAdminCommunityRow,
  SysAdminMemberStatsRow,
  SysAdminMonthActivitySnapshotRow,
  SysAdminMonthlyActivityRow,
  SysAdminNewMemberCountRow,
  SysAdminPlatformTotalsRow,
} from "@/application/domain/sysadmin/data/type";
import { ISysAdminRepository } from "@/application/domain/sysadmin/data/interface";

/**
 * SQL helpers for the sysadmin analytics surface.
 *
 * Conventions inherited from the report repository:
 *   - Every read goes through `ctx.issuer.public`; MVs are RLS-less and
 *     `t_memberships` / `t_transactions` are protected upstream by the
 *     `@authz(rules: [IsAdmin])` directive.
 *   - `t_transactions.created_at` and `t_memberships.created_at` are
 *     timestamp WITHOUT time zone (Prisma DateTime default) holding naive
 *     UTC. JST-calendar date boundaries are converted to naive UTC on the
 *     constant side (`::date AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC'`)
 *     so the B-tree indexes on `created_at` stay SARGable.
 *   - `::int` and `::bigint` casts on aggregate outputs keep Prisma from
 *     surfacing bigints for small counts.
 */
@injectable()
export default class SysAdminRepository implements ISysAdminRepository {
  async findAllCommunities(ctx: IContext): Promise<SysAdminCommunityRow[]> {
    return ctx.issuer.public(ctx, async (tx) => {
      const rows = await tx.$queryRaw<{ id: string; name: string }[]>`
        SELECT c."id", c."name"
        FROM "t_communities" c
        ORDER BY c."name" ASC
      `;
      return rows.map((r) => ({ communityId: r.id, communityName: r.name }));
    });
  }

  async findCommunityById(
    ctx: IContext,
    communityId: string,
  ): Promise<SysAdminCommunityRow | null> {
    return ctx.issuer.public(ctx, async (tx) => {
      const rows = await tx.$queryRaw<{ id: string; name: string }[]>`
        SELECT c."id", c."name"
        FROM "t_communities" c
        WHERE c."id" = ${communityId}
        LIMIT 1
      `;
      if (rows.length === 0) return null;
      const r = rows[0];
      return { communityId: r.id, communityName: r.name };
    });
  }

  /**
   * One row per JOINED member with tenure + donation-out counters at
   * `asOf`. `months_in` is the JST-calendar-month difference (floor,
   * minimum 1) so a member who joined today and a member who joined
   * earlier this month both get `months_in = 1` — the spec defines
   * tenure in completed-month units, not days.
   *
   * `donation_out_months` counts DISTINCT JST calendar months with at
   * least one DONATION-out originating from a wallet owned by this
   * member in this community. `total_points_out` sums the Int
   * `from_point_change` column; the `::bigint` upcast protects against
   * overflow once SUM aggregates enough rows.
   *
   * `user_send_rate` is emitted already-rounded to 3dp so the presenter
   * stays a pure shape-mapper.
   *
   * The `t.created_at <= asOf` comparison is a naive-UTC vs naive-UTC
   * compare — both sides hold the same storage format, no timezone
   * dance required.
   */
  async findMemberStats(
    ctx: IContext,
    communityId: string,
    asOf: Date,
  ): Promise<SysAdminMemberStatsRow[]> {
    return ctx.issuer.public(ctx, async (tx) => {
      const rows = await tx.$queryRaw<
        {
          user_id: string;
          name: string | null;
          months_in: number;
          donation_out_months: number;
          total_points_out: bigint;
          user_send_rate: number;
        }[]
      >`
        WITH members AS (
          -- Filter to members whose membership existed at asOf.
          -- Without this, a historic asOf would include members who
          -- joined after that point, inflating stageCounts.total,
          -- polluting stage classification, and leaking future members
          -- into the paginated list. findMonthActivity already scopes
          -- total_members this way; mirroring it keeps the activity
          -- rate denominator consistent with stageCounts.total.
          SELECT
            m."user_id",
            m."created_at"
          FROM "t_memberships" m
          WHERE m."community_id" = ${communityId}
            AND m."status" = 'JOINED'
            AND m."created_at" < (
              ((${asOf}::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo')::date + 1)
              AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC'
            )
        ),
        donation_months AS (
          SELECT
            fw."user_id" AS user_id,
            DATE_TRUNC(
              'month',
              (t."created_at" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo')
            ) AS jst_month,
            SUM(t."from_point_change") AS month_points_out
          FROM "t_transactions" t
          INNER JOIN "t_wallets" fw
            ON fw."id" = t."from"
            AND fw."community_id" = ${communityId}
          INNER JOIN members m ON m."user_id" = fw."user_id"
          WHERE t."reason" = 'DONATION'
            AND t."created_at" < (
              ((${asOf}::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo')::date + 1)
              AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC'
            )
            -- JST-day-unit upper bound so donation activity lines up
            -- with the member-tenure bound in the members CTE above.
            -- findMonthActivity / findPlatformTotals also use this
            -- unit, so stageCounts.total and the activity-rate
            -- denominator agree on what "as of asOf" includes.
          GROUP BY fw."user_id", jst_month
        )
        SELECT
          m."user_id",
          u."name" AS "name",
          -- months_in counts the DISTINCT JST calendar months the
          -- member has been present in (join-month through asOf-month
          -- inclusive), NOT the raw month-number difference. A member
          -- who joined March 15 and is measured on April 10 has been
          -- present in 2 distinct months (March and April), so
          -- months_in = 2. Matches the frame used by
          -- donation_out_months (COUNT DISTINCT jst_month) so
          -- user_send_rate stays bounded in [0, 1]. The +1 is what
          -- turns "month diff" into "month span"; GREATEST(1, ...)
          -- stays as a defense against any future clock-skew surprise.
          GREATEST(
            1,
            (
              (
                EXTRACT(YEAR FROM (${asOf}::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo'))::int
                - EXTRACT(YEAR FROM (m."created_at" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo'))::int
              ) * 12
              + (
                EXTRACT(MONTH FROM (${asOf}::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo'))::int
                - EXTRACT(MONTH FROM (m."created_at" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo'))::int
              )
              + 1
            )
          )::int AS months_in,
          COALESCE(COUNT(DISTINCT dm.jst_month), 0)::int AS donation_out_months,
          COALESCE(SUM(dm.month_points_out), 0)::bigint AS total_points_out,
          -- Denominator matches the months_in expression above so
          -- user_send_rate is guaranteed in [0, 1]. GREATEST(1, ...)
          -- keeps the divisor >= 1; no explicit zero-branch needed.
          ROUND(
            COALESCE(COUNT(DISTINCT dm.jst_month), 0)::numeric
              / GREATEST(
                  1,
                  (
                    (
                      EXTRACT(YEAR FROM (${asOf}::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo'))::int
                      - EXTRACT(YEAR FROM (m."created_at" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo'))::int
                    ) * 12
                    + (
                      EXTRACT(MONTH FROM (${asOf}::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo'))::int
                      - EXTRACT(MONTH FROM (m."created_at" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo'))::int
                    )
                    + 1
                  )
                )::numeric,
            3
          )::double precision AS user_send_rate
        FROM members m
        LEFT JOIN donation_months dm ON dm.user_id = m."user_id"
        LEFT JOIN "t_users" u ON u."id" = m."user_id"
        GROUP BY m."user_id", m."created_at", u."name"
        ORDER BY m."user_id"
      `;
      return rows.map((r) => ({
        userId: r.user_id,
        name: r.name,
        monthsIn: r.months_in,
        donationOutMonths: r.donation_out_months,
        totalPointsOut: r.total_points_out,
        userSendRate: r.user_send_rate,
      }));
    });
  }

  /**
   * `windowMonths` trailing JST months (inclusive of the asOf month).
   * Sources everything off MVs except the member counts, which come
   * from `t_memberships` so "new_members" / "total_members" are not
   * tied to MV refresh cadence.
   *
   * `total_members_end_of_month` counts JOINED memberships whose
   * `created_at` is before the next-month boundary — the same frame
   * used by `monthlyActivityRate`'s denominator so the rate stays
   * self-consistent.
   */
  async findMonthlyActivity(
    ctx: IContext,
    communityId: string,
    asOf: Date,
    windowMonths: number,
  ): Promise<SysAdminMonthlyActivityRow[]> {
    return ctx.issuer.public(ctx, async (tx) => {
      const rows = await tx.$queryRaw<
        {
          month_start: Date;
          sender_count: number;
          total_members_end_of_month: number;
          new_members: number;
          donation_points_sum: bigint;
          donation_tx_count: number;
          donation_chain_tx_count: number;
        }[]
      >`
        WITH month_starts AS (
          SELECT gs::date AS month_start
          FROM generate_series(
            DATE_TRUNC(
              'month',
              (${asOf}::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo')
            ) - make_interval(months => ${windowMonths} - 1),
            DATE_TRUNC(
              'month',
              (${asOf}::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo')
            ),
            '1 month'
          ) AS gs
        ),
        month_bounds AS (
          SELECT
            month_start,
            (month_start + INTERVAL '1 month')::date AS next_month_start,
            -- Membership-side upper bound: clamp at (asOf JST day + 1)
            -- so the most recent month doesn't count members who
            -- joined after asOf. For past months the LEAST collapses
            -- to next_month_start, so behaviour is unchanged. Mirrors
            -- the clamp findMemberStats / findMonthActivity already
            -- apply, so totalMembersEndOfMonth on the trend lines up
            -- with stageCounts.total and the summary-card rate.
            LEAST(
              (month_start + INTERVAL '1 month')::date,
              ((${asOf}::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo')::date + 1)
            ) AS member_upper
          FROM month_starts
        ),
        senders AS (
          SELECT
            mb.month_start,
            COUNT(DISTINCT mv."user_id")::int AS sender_count
          FROM month_bounds mb
          LEFT JOIN "mv_user_transaction_daily" mv
            ON mv."community_id" = ${communityId}
            AND mv."date" >= mb.month_start
            AND mv."date" <  mb.next_month_start
            AND mv."donation_out_count" > 0
          GROUP BY mb.month_start
        ),
        tx_totals AS (
          SELECT
            mb.month_start,
            COALESCE(SUM(
              CASE WHEN ts."reason" = 'DONATION' THEN ts."points_sum" ELSE 0 END
            ), 0)::bigint AS donation_points_sum,
            COALESCE(SUM(
              CASE WHEN ts."reason" = 'DONATION' THEN ts."tx_count" ELSE 0 END
            ), 0)::int AS donation_tx_count,
            -- chain_root_count is chain_depth=1 (root of a chain),
            -- chain_descendant_count is chain_depth>=2. The sum is
            -- "transactions that are part of a chain" for this reason.
            COALESCE(SUM(
              CASE WHEN ts."reason" = 'DONATION'
                THEN ts."chain_root_count" + ts."chain_descendant_count"
                ELSE 0
              END
            ), 0)::int AS donation_chain_tx_count
          FROM month_bounds mb
          LEFT JOIN "mv_transaction_summary_daily" ts
            ON ts."community_id" = ${communityId}
            AND ts."date" >= mb.month_start
            AND ts."date" <  mb.next_month_start
          GROUP BY mb.month_start
        ),
        new_members AS (
          -- Use member_upper instead of next_month_start so the asOf
          -- month only counts joiners up to asOf itself.
          SELECT
            mb.month_start,
            COUNT(m."user_id")::int AS new_members
          FROM month_bounds mb
          LEFT JOIN "t_memberships" m
            ON m."community_id" = ${communityId}
            AND m."status" = 'JOINED'
            AND m."created_at" >= (mb.month_start AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
            AND m."created_at" <  (mb.member_upper AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
          GROUP BY mb.month_start
        ),
        total_members AS (
          -- Same clamp on the cumulative count: asOf month's
          -- denominator stops at asOf+1 JST day, never the full
          -- calendar month.
          SELECT
            mb.month_start,
            COUNT(m."user_id")::int AS total_members_end_of_month
          FROM month_bounds mb
          LEFT JOIN "t_memberships" m
            ON m."community_id" = ${communityId}
            AND m."status" = 'JOINED'
            AND m."created_at" <  (mb.member_upper AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
          GROUP BY mb.month_start
        )
        SELECT
          mb.month_start,
          COALESCE(s.sender_count, 0)::int AS sender_count,
          COALESCE(tm.total_members_end_of_month, 0)::int AS total_members_end_of_month,
          COALESCE(nm.new_members, 0)::int AS new_members,
          COALESCE(tt.donation_points_sum, 0)::bigint AS donation_points_sum,
          COALESCE(tt.donation_tx_count, 0)::int AS donation_tx_count,
          COALESCE(tt.donation_chain_tx_count, 0)::int AS donation_chain_tx_count
        FROM month_bounds mb
        LEFT JOIN senders s USING (month_start)
        LEFT JOIN tx_totals tt USING (month_start)
        LEFT JOIN new_members nm USING (month_start)
        LEFT JOIN total_members tm USING (month_start)
        ORDER BY mb.month_start ASC
      `;
      return rows.map((r) => ({
        monthStart: r.month_start,
        senderCount: r.sender_count,
        totalMembersEndOfMonth: r.total_members_end_of_month,
        newMembers: r.new_members,
        donationPointsSum: r.donation_points_sum,
        donationTxCount: r.donation_tx_count,
        donationChainTxCount: r.donation_chain_tx_count,
      }));
    });
  }

  async findMonthActivity(
    ctx: IContext,
    communityId: string,
    jstMonthStart: Date,
    jstNextMonthStart: Date,
  ): Promise<SysAdminMonthActivitySnapshotRow> {
    return ctx.issuer.public(ctx, async (tx) => {
      const rows = await tx.$queryRaw<{ sender_count: number; total_members: number }[]>`
        WITH senders AS (
          SELECT COUNT(DISTINCT "user_id")::int AS n
          FROM "mv_user_transaction_daily"
          WHERE "community_id" = ${communityId}
            AND "date" >= ${jstMonthStart}::date
            AND "date" <  ${jstNextMonthStart}::date
            AND "donation_out_count" > 0
        ),
        members AS (
          SELECT COUNT(*)::int AS n
          FROM "t_memberships"
          WHERE "community_id" = ${communityId}
            AND "status" = 'JOINED'
            AND "created_at" <  (${jstNextMonthStart}::date AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
        )
        SELECT s.n AS sender_count, m.n AS total_members
        FROM senders s, members m
      `;
      const r = rows[0];
      return {
        senderCount: r.sender_count,
        totalMembers: r.total_members,
      };
    });
  }

  async findNewMemberCount(
    ctx: IContext,
    communityId: string,
    from: Date,
    to: Date,
  ): Promise<SysAdminNewMemberCountRow> {
    return ctx.issuer.public(ctx, async (tx) => {
      const rows = await tx.$queryRaw<{ n: number }[]>`
        SELECT COUNT(*)::int AS n
        FROM "t_memberships"
        WHERE "community_id" = ${communityId}
          AND "status" = 'JOINED'
          AND "created_at" >= (${from}::date AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
          AND "created_at" <  (${to}::date AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
      `;
      return { count: rows[0]?.n ?? 0 };
    });
  }

  /**
   * All-time DONATION totals + the data window actually covered by the
   * MV for this community. `max_chain_depth` reads the live
   * `t_transactions.chain_depth` column so the summary card surfaces
   * the literal deepest chain rather than a month-bucketed max.
   */
  async findAllTimeTotals(ctx: IContext, communityId: string): Promise<SysAdminAllTimeTotalsRow> {
    return ctx.issuer.public(ctx, async (tx) => {
      const rows = await tx.$queryRaw<
        {
          total_donation_points: bigint;
          max_chain_depth: number | null;
          data_from: Date | null;
          data_to: Date | null;
        }[]
      >`
        WITH donation_totals AS (
          SELECT
            COALESCE(SUM(t."from_point_change"), 0)::bigint AS total_donation_points,
            MAX(t."chain_depth")::int AS max_chain_depth
          FROM "t_transactions" t
          INNER JOIN "t_wallets" fw
            ON fw."id" = t."from"
            AND fw."community_id" = ${communityId}
          WHERE t."reason" = 'DONATION'
        ),
        data_range AS (
          SELECT
            MIN("date") AS data_from,
            MAX("date") AS data_to
          FROM "mv_transaction_summary_daily"
          WHERE "community_id" = ${communityId}
        )
        SELECT
          dt.total_donation_points,
          dt.max_chain_depth,
          dr.data_from,
          dr.data_to
        FROM donation_totals dt, data_range dr
      `;
      const r = rows[0];
      return {
        totalDonationPoints: r.total_donation_points,
        maxChainDepth: r.max_chain_depth,
        dataFrom: r.data_from,
        dataTo: r.data_to,
      };
    });
  }

  async findPlatformTotals(
    ctx: IContext,
    jstMonthStart: Date,
    jstNextMonthStart: Date,
  ): Promise<SysAdminPlatformTotalsRow> {
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
