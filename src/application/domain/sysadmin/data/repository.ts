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
  SysAdminWeeklyRetentionRow,
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
          SELECT
            m."user_id",
            m."created_at"
          FROM "t_memberships" m
          WHERE m."community_id" = ${communityId}
            AND m."status" = 'JOINED'
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
            AND t."created_at" <= ${asOf}::timestamp
          GROUP BY fw."user_id", jst_month
        )
        SELECT
          m."user_id",
          u."name" AS "name",
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
            )
          )::int AS months_in,
          COALESCE(COUNT(DISTINCT dm.jst_month), 0)::int AS donation_out_months,
          COALESCE(SUM(dm.month_points_out), 0)::bigint AS total_points_out,
          CASE
            WHEN GREATEST(
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
              )
            ) = 0 THEN 0::double precision
            ELSE ROUND(
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
                    )
                  )::numeric,
              3
            )::double precision
          END AS user_send_rate
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
            (month_start + INTERVAL '1 month')::date AS next_month_start
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
          SELECT
            mb.month_start,
            COUNT(m."user_id")::int AS new_members
          FROM month_bounds mb
          LEFT JOIN "t_memberships" m
            ON m."community_id" = ${communityId}
            AND m."status" = 'JOINED'
            AND m."created_at" >= (mb.month_start AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
            AND m."created_at" <  (mb.next_month_start AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
          GROUP BY mb.month_start
        ),
        total_members AS (
          SELECT
            mb.month_start,
            COUNT(m."user_id")::int AS total_members_end_of_month
          FROM month_bounds mb
          LEFT JOIN "t_memberships" m
            ON m."community_id" = ${communityId}
            AND m."status" = 'JOINED'
            AND m."created_at" <  (mb.next_month_start AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
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

  /**
   * Bulk weekly retention series. Replaces the per-week loop that
   * fired 2 × `windowMonths × ~4.3` queries per L2 detail load.
   *
   * Single round-trip, three phases:
   *   1. Pre-aggregate `mv_user_transaction_daily` into per-user-week
   *      `is_sender` / `is_receiver` flags, scanning [earliest target
   *      week - 12 weeks, latest target week + 7 days) exactly once.
   *   2. For each (target_week, user) with sender/receiver activity in
   *      either the current or previous week, evaluate the
   *      retained / churned / returned / current_active cells via a
   *      FULL OUTER JOIN on (user_id, week) between current and prev.
   *      `has_ever_before` is a set lookup against the same
   *      pre-aggregation, bounded to the 12-week lookback.
   *   3. Layer in `new_members` (t_memberships.created_at) and
   *      `total_members` (JOINED count as of week end) from separate
   *      per-week aggregates so the response needs no second call.
   *
   * Retention semantics match `ReportRepository.findRetentionAggregate`:
   *   - `is_sender` ⇔ `donation_out_count > 0` (peer-to-peer DONATION
   *     only; ONBOARDING / GRANT recipients don't count).
   *   - 12-week `ever_before` lookback is the same bounded-history
   *     window so "returned" semantics match the single-week method.
   *
   * Input contract: `weekStarts` is a non-empty array of JST Mondays
   * encoded as UTC-midnight dates, strictly ascending, each exactly
   * 7 days apart. The service layer produces this via `isoWeekStartJst`
   * + `addDays(wk, 7)`.
   */
  async findWeeklyRetentionSeries(
    ctx: IContext,
    communityId: string,
    weekStarts: Date[],
  ): Promise<SysAdminWeeklyRetentionRow[]> {
    if (weekStarts.length === 0) return [];
    return ctx.issuer.public(ctx, async (tx) => {
      const rows = await tx.$queryRaw<
        {
          week_start: Date;
          retained_senders: number;
          churned_senders: number;
          returned_senders: number;
          current_senders_count: number;
          current_active_count: number;
          new_members: number;
          total_members: number;
        }[]
      >`
        WITH target_weeks AS (
          SELECT unnest(${weekStarts}::date[]) AS week_start
        ),
        lookback_bounds AS (
          -- 12 weeks before the earliest target week powers the
          -- ever_before lookback; the +7 days past the latest target
          -- week makes sure the last week's "is_sender" aggregation
          -- sees its full 7-day bucket.
          SELECT
            (MIN(week_start) - INTERVAL '12 weeks')::date AS first_date,
            (MAX(week_start) + INTERVAL '7 days')::date   AS last_date
          FROM target_weeks
        ),
        user_week_flags AS (
          SELECT
            mv."user_id",
            DATE_TRUNC('week', mv."date")::date AS week_start,
            BOOL_OR(mv."donation_out_count" > 0) AS is_sender,
            BOOL_OR(mv."received_donation_count" > 0) AS is_receiver
          FROM "mv_user_transaction_daily" mv
          CROSS JOIN lookback_bounds lb
          WHERE mv."community_id" = ${communityId}
            AND mv."date" >= lb.first_date
            AND mv."date" <  lb.last_date
          GROUP BY mv."user_id", DATE_TRUNC('week', mv."date")
        ),
        ever_before AS (
          -- For each (target_week, user), has the user sent in any
          -- week within [target_week - 12w, target_week - 7d)? Set
          -- lookup kept separate so per-user-week we evaluate it once.
          SELECT DISTINCT
            tw.week_start AS target_week,
            uwf."user_id"
          FROM target_weeks tw
          INNER JOIN user_week_flags uwf
            ON uwf.week_start >= (tw.week_start - INTERVAL '12 weeks')::date
            AND uwf.week_start <  (tw.week_start - INTERVAL '7 days')::date
            AND uwf.is_sender = true
        ),
        per_target AS (
          -- current-week ⊕ prev-week via FULL OUTER JOIN on user_id so
          -- a user active in either frame contributes exactly one row
          -- per target week.
          SELECT
            tw.week_start AS target_week,
            COALESCE(cw."user_id", pw."user_id") AS user_id,
            cw.is_sender AS curr_is_sender,
            cw.is_receiver AS curr_is_receiver,
            pw.is_sender AS prev_is_sender
          FROM target_weeks tw
          LEFT JOIN user_week_flags cw
            ON cw.week_start = tw.week_start
          FULL OUTER JOIN user_week_flags pw
            ON pw.week_start = (tw.week_start - INTERVAL '7 days')::date
            AND (cw."user_id" IS NULL OR pw."user_id" = cw."user_id")
          WHERE cw."user_id" IS NOT NULL OR pw."user_id" IS NOT NULL
        ),
        retention_counts AS (
          SELECT
            pt.target_week AS week_start,
            COUNT(*) FILTER (
              WHERE pt.curr_is_sender = true AND pt.prev_is_sender = true
            )::int AS retained_senders,
            COUNT(*) FILTER (
              WHERE pt.prev_is_sender = true
                AND (pt.curr_is_sender IS NULL OR pt.curr_is_sender = false)
            )::int AS churned_senders,
            COUNT(*) FILTER (
              WHERE pt.curr_is_sender = true
                AND (pt.prev_is_sender IS NULL OR pt.prev_is_sender = false)
                AND eb."user_id" IS NOT NULL
            )::int AS returned_senders,
            COUNT(*) FILTER (WHERE pt.curr_is_sender = true)::int AS current_senders_count,
            COUNT(*) FILTER (
              WHERE pt.curr_is_sender = true OR pt.curr_is_receiver = true
            )::int AS current_active_count
          FROM per_target pt
          LEFT JOIN ever_before eb
            ON eb.target_week = pt.target_week
            AND eb."user_id" = pt.user_id
          GROUP BY pt.target_week
        ),
        new_members_per_week AS (
          SELECT
            tw.week_start,
            COUNT(m."user_id")::int AS new_members
          FROM target_weeks tw
          LEFT JOIN "t_memberships" m
            ON m."community_id" = ${communityId}
            AND m."status" = 'JOINED'
            AND m."created_at" >= (tw.week_start::date AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
            AND m."created_at" <  ((tw.week_start + INTERVAL '7 days')::date AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
          GROUP BY tw.week_start
        ),
        total_members_per_week AS (
          -- Week-end total_members denominator for the rate. Counts
          -- JOINED memberships with created_at strictly before the
          -- following Monday (JST) — same "as-of week end" frame the
          -- L1 month rate uses at the month boundary.
          SELECT
            tw.week_start,
            COUNT(m."user_id")::int AS total_members
          FROM target_weeks tw
          LEFT JOIN "t_memberships" m
            ON m."community_id" = ${communityId}
            AND m."status" = 'JOINED'
            AND m."created_at" <  ((tw.week_start + INTERVAL '7 days')::date AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
          GROUP BY tw.week_start
        )
        SELECT
          tw.week_start,
          COALESCE(rc.retained_senders, 0)::int      AS retained_senders,
          COALESCE(rc.churned_senders, 0)::int       AS churned_senders,
          COALESCE(rc.returned_senders, 0)::int      AS returned_senders,
          COALESCE(rc.current_senders_count, 0)::int AS current_senders_count,
          COALESCE(rc.current_active_count, 0)::int  AS current_active_count,
          COALESCE(nm.new_members, 0)::int           AS new_members,
          COALESCE(tm.total_members, 0)::int         AS total_members
        FROM target_weeks tw
        LEFT JOIN retention_counts      rc ON rc.week_start = tw.week_start
        LEFT JOIN new_members_per_week  nm ON nm.week_start = tw.week_start
        LEFT JOIN total_members_per_week tm ON tm.week_start = tw.week_start
        ORDER BY tw.week_start ASC
      `;
      return rows.map((r) => ({
        weekStart: r.week_start,
        retainedSenders: r.retained_senders,
        churnedSenders: r.churned_senders,
        returnedSenders: r.returned_senders,
        currentSendersCount: r.current_senders_count,
        currentActiveCount: r.current_active_count,
        newMembers: r.new_members,
        totalMembers: r.total_members,
      }));
    });
  }
}
