import { injectable } from "tsyringe";
import { IContext } from "@/types/server";
import {
  SysAdminAllTimeTotalsRow,
  SysAdminCommunityRow,
  SysAdminMemberStatsRow,
  SysAdminActivitySnapshotRow,
  SysAdminMonthlyActivityRow,
  SysAdminHubMemberCountRow,
  SysAdminNewMemberCountRow,
  SysAdminPlatformTotalsRow,
  SysAdminWindowActivityCountsRow,
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
          unique_donation_recipients: number;
        }[]
      >`
        WITH asof_jst AS (
          -- The asOf instant expressed in JST, computed once so every
          -- downstream CTE can reuse the same naive JST timestamp
          -- (for year/month extraction and day-boundary derivation).
          SELECT (${asOf}::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo') AS ts
        ),
        asof_bound AS (
          -- Derive the "asOf JST day + 1, at JST midnight, expressed
          -- as a naive UTC timestamp" once and reuse everywhere the
          -- query wants an exclusive upper bound on t_*.created_at.
          -- The expression is the same JST-day clamp findActivitySnapshot
          -- / findMonthlyActivity receive pre-computed from the
          -- service layer; inlining it into a single CTE here keeps
          -- findMemberStats' signature unchanged without duplicating
          -- the double-AT TIME ZONE dance across three WHERE clauses.
          SELECT
            ((ts::date + 1) AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC') AS upper_ts
          FROM asof_jst
        ),
        members AS (
          -- Filter to members whose membership existed at asOf.
          -- Without this, a historic asOf would include members who
          -- joined after that point, inflating stageCounts.total,
          -- polluting stage classification, and leaking future members
          -- into the paginated list. findActivitySnapshot already scopes
          -- total_members this way; mirroring it keeps the activity
          -- rate denominator consistent with stageCounts.total.
          SELECT
            m."user_id",
            m."created_at"
          FROM "t_memberships" m, asof_bound ab
          WHERE m."community_id" = ${communityId}
            AND m."status" = 'JOINED'
            AND m."created_at" < ab.upper_ts
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
          CROSS JOIN asof_bound ab
          WHERE t."reason" = 'DONATION'
            AND t."created_at" < ab.upper_ts
            -- JST-day-unit upper bound so donation activity lines up
            -- with the member-tenure bound in the members CTE above.
            -- findActivitySnapshot / findPlatformTotals also use this
            -- unit, so stageCounts.total and the activity-rate
            -- denominator agree on what "as of asOf" includes.
          GROUP BY fw."user_id", jst_month
        ),
        donation_recipients AS (
          -- Per-sender count of DISTINCT recipient user_ids over the
          -- whole tenure (clamped at asOf). This is the "network
          -- breadth" half of the donor profile and cannot be derived
          -- from mv_user_transaction_daily — that MV's
          -- unique_counterparties column is per-day and does not
          -- compose into an all-time DISTINCT (the same recipient
          -- across multiple days would double-count under SUM).
          --
          -- Scoped to (a) DONATION transactions only, (b) sender wallet
          -- in this community, and (c) recipient wallet either
          -- in-community or unattached — same "no cross-community
          -- leakage" guard that mv_user_transaction_daily and
          -- v_transaction_comments apply at the view layer. Wallets
          -- without a user_id (burn / system targets) are excluded so
          -- a member who only donated into a burn target scores 0.
          SELECT
            fw."user_id" AS user_id,
            COUNT(DISTINCT tw."user_id")::int AS unique_recipients
          FROM "t_transactions" t
          INNER JOIN "t_wallets" fw
            ON fw."id" = t."from"
            AND fw."community_id" = ${communityId}
          INNER JOIN "t_wallets" tw
            ON tw."id" = t."to"
            AND tw."user_id" IS NOT NULL
          INNER JOIN members m ON m."user_id" = fw."user_id"
          CROSS JOIN asof_bound ab
          WHERE t."reason" = 'DONATION'
            AND t."created_at" < ab.upper_ts
            AND (tw."community_id" IS NULL OR tw."community_id" = fw."community_id")
          GROUP BY fw."user_id"
        ),
        member_tenure AS (
          -- Compute months_in ONCE per member so the final SELECT can
          -- reuse it as both months_in and the denominator of
          -- user_send_rate. The formula is "distinct JST calendar
          -- months the member has been present in (join-month through
          -- asOf-month inclusive)" — the +1 turns the month-number
          -- diff into a span count, matching how
          -- donation_out_months (COUNT DISTINCT jst_month) counts.
          -- GREATEST(1, ...) defends against any future clock skew.
          -- Pulling the asOf-side conversion from asof_jst.ts avoids
          -- re-running the double AT TIME ZONE cast once per row.
          SELECT
            m."user_id",
            GREATEST(
              1,
              (
                (
                  EXTRACT(YEAR FROM aj.ts)::int
                  - EXTRACT(YEAR FROM (m."created_at" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo'))::int
                ) * 12
                + (
                  EXTRACT(MONTH FROM aj.ts)::int
                  - EXTRACT(MONTH FROM (m."created_at" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo'))::int
                )
                + 1
              )
            )::int AS months_in
          FROM members m, asof_jst aj
        )
        SELECT
          m."user_id",
          u."name" AS "name",
          mt.months_in,
          COALESCE(COUNT(DISTINCT dm.jst_month), 0)::int AS donation_out_months,
          COALESCE(SUM(dm.month_points_out), 0)::bigint AS total_points_out,
          -- GREATEST(1, ...) inside member_tenure guarantees the
          -- divisor is >= 1; no zero branch needed around ROUND.
          ROUND(
            COALESCE(COUNT(DISTINCT dm.jst_month), 0)::numeric
              / mt.months_in::numeric,
            3
          )::double precision AS user_send_rate,
          -- donation_recipients is pre-grouped by user_id, so each
          -- sender appears at most once on the right side of the
          -- LEFT JOIN. MAX() (rather than adding the column to GROUP
          -- BY) propagates that single value through the per-user
          -- grouping cleanly and matches the COALESCE/MAX pattern
          -- used elsewhere when joining a pre-aggregated CTE.
          COALESCE(MAX(dr.unique_recipients), 0)::int AS unique_donation_recipients
        FROM members m
        INNER JOIN member_tenure mt ON mt."user_id" = m."user_id"
        LEFT JOIN donation_months dm ON dm.user_id = m."user_id"
        LEFT JOIN donation_recipients dr ON dr.user_id = m."user_id"
        LEFT JOIN "t_users" u ON u."id" = m."user_id"
        GROUP BY m."user_id", mt.months_in, u."name"
        ORDER BY m."user_id"
      `;
      return rows.map((r) => ({
        userId: r.user_id,
        name: r.name,
        monthsIn: r.months_in,
        donationOutMonths: r.donation_out_months,
        totalPointsOut: r.total_points_out,
        userSendRate: r.user_send_rate,
        uniqueDonationRecipients: r.unique_donation_recipients,
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
          donation_tx_count: bigint;
          donation_chain_tx_count: bigint;
        }[]
      >`
        WITH month_starts AS (
          SELECT gs::date AS month_start
          FROM generate_series(
            DATE_TRUNC(
              'month',
              (${asOf}::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo')
            ) - make_interval(months => (${windowMonths})::int - 1),
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
            -- the clamp findMemberStats / findActivitySnapshot already
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
            -- Use member_upper (LEAST of next_month_start and
            -- asOf+1 JST) as the upper bound so the asOf month's
            -- sender count doesn't include MV rows past asOf when a
            -- historic asOf is supplied. Keeps the numerator aligned
            -- with total_members in member_counts below.
            AND mv."date" <  mb.member_upper
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
            ), 0)::bigint AS donation_tx_count,
            -- chain_root_count is chain_depth=1 (root of a chain),
            -- chain_descendant_count is chain_depth>=2. The sum is
            -- "transactions that are part of a chain" for this reason.
            -- COALESCE each column so a hypothetical NULL (MV reshape,
            -- LEFT JOIN miss) doesn't null out the whole addition and
            -- silently drop from SUM. ::bigint so the tx count cannot
            -- overflow int32 (~2.1B) on long-running or busy
            -- communities — the Presenter converts through
            -- bigintToSafeNumber before it hits the GraphQL payload.
            COALESCE(SUM(
              CASE WHEN ts."reason" = 'DONATION'
                THEN COALESCE(ts."chain_root_count", 0)
                     + COALESCE(ts."chain_descendant_count", 0)
                ELSE 0
              END
            ), 0)::bigint AS donation_chain_tx_count
          FROM month_bounds mb
          LEFT JOIN "mv_transaction_summary_daily" ts
            ON ts."community_id" = ${communityId}
            AND ts."date" >= mb.month_start
            -- Match the member_counts / senders clamp. Historic asOf
            -- queries must not pull tx activity from dates past
            -- asOf; past months collapse member_upper back to
            -- next_month_start so behaviour is unchanged there.
            AND ts."date" <  mb.member_upper
          GROUP BY mb.month_start
        ),
        member_counts AS (
          -- Single-scan pass over t_memberships computes both
          -- new_members and total_members_end_of_month. The JOIN
          -- predicate bounds everything at member_upper (asOf+1 JST
          -- day for the asOf month, next_month_start otherwise); the
          -- new_members FILTER narrows further to rows that joined
          -- in the month itself. Collapsing the two previous CTEs
          -- halves the LEFT JOINs against t_memberships.
          SELECT
            mb.month_start,
            COUNT(m."user_id") FILTER (
              WHERE m."created_at" >= (mb.month_start AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
            )::int AS new_members,
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
          COALESCE(mc.total_members_end_of_month, 0)::int AS total_members_end_of_month,
          COALESCE(mc.new_members, 0)::int AS new_members,
          COALESCE(tt.donation_points_sum, 0)::bigint AS donation_points_sum,
          COALESCE(tt.donation_tx_count, 0)::bigint AS donation_tx_count,
          COALESCE(tt.donation_chain_tx_count, 0)::bigint AS donation_chain_tx_count
        FROM month_bounds mb
        LEFT JOIN senders s USING (month_start)
        LEFT JOIN tx_totals tt USING (month_start)
        LEFT JOIN member_counts mc USING (month_start)
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

  async findActivitySnapshot(
    ctx: IContext,
    communityId: string,
    jstMonthStart: Date,
    jstNextMonthStart: Date,
  ): Promise<SysAdminActivitySnapshotRow> {
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

  async findWindowActivityCounts(
    ctx: IContext,
    communityId: string,
    prevLower: Date,
    currLower: Date,
    upper: Date,
  ): Promise<SysAdminWindowActivityCountsRow> {
    return ctx.issuer.public(ctx, async (tx) => {
      const rows = await tx.$queryRaw<
        {
          curr_sender_count: number;
          prev_sender_count: number;
          retained_count: number;
          curr_new_member_count: number;
          prev_new_member_count: number;
        }[]
      >`
        WITH window_senders AS (
          -- One MV scan over [prevLower, upper). Per-user aggregation
          -- collapses each user's daily rows into two booleans
          -- recording whether they sent a DONATION in the current /
          -- previous window. The outer FILTER clauses then count
          -- senders, prev-senders, and the intersection (retained)
          -- without rescanning the MV.
          SELECT
            "user_id",
            bool_or("date" >= ${currLower}::date AND "date" <  ${upper}::date) AS in_curr,
            bool_or("date" >= ${prevLower}::date AND "date" <  ${currLower}::date) AS in_prev
          FROM "mv_user_transaction_daily"
          WHERE "community_id" = ${communityId}
            AND "donation_out_count" > 0
            AND "date" >= ${prevLower}::date
            AND "date" <  ${upper}::date
          GROUP BY "user_id"
        ),
        sender_aggregates AS (
          SELECT
            COUNT(*) FILTER (WHERE in_curr)::int                AS curr_sender_count,
            COUNT(*) FILTER (WHERE in_prev)::int                AS prev_sender_count,
            COUNT(*) FILTER (WHERE in_curr AND in_prev)::int    AS retained_count
          FROM window_senders
        ),
        new_members AS (
          -- One t_memberships scan over [prevLower, upper).
          -- Same FILTER pattern: split current vs previous in one pass.
          SELECT
            COUNT(*) FILTER (
              WHERE "created_at" >= (${currLower}::date AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
                AND "created_at" <  (${upper}::date     AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
            )::int AS curr_new_member_count,
            COUNT(*) FILTER (
              WHERE "created_at" >= (${prevLower}::date AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
                AND "created_at" <  (${currLower}::date AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
            )::int AS prev_new_member_count
          FROM "t_memberships"
          WHERE "community_id" = ${communityId}
            AND "status" = 'JOINED'
            AND "created_at" >= (${prevLower}::date AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
            AND "created_at" <  (${upper}::date     AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
        )
        SELECT
          COALESCE(s.curr_sender_count, 0)     AS curr_sender_count,
          COALESCE(s.prev_sender_count, 0)     AS prev_sender_count,
          COALESCE(s.retained_count, 0)        AS retained_count,
          COALESCE(n.curr_new_member_count, 0) AS curr_new_member_count,
          COALESCE(n.prev_new_member_count, 0) AS prev_new_member_count
        FROM sender_aggregates s
        CROSS JOIN new_members n
      `;
      const r = rows[0];
      return {
        senderCount: r?.curr_sender_count ?? 0,
        senderCountPrev: r?.prev_sender_count ?? 0,
        retainedSenders: r?.retained_count ?? 0,
        newMemberCount: r?.curr_new_member_count ?? 0,
        newMemberCountPrev: r?.prev_new_member_count ?? 0,
      };
    });
  }

  async findWindowHubMemberCount(
    ctx: IContext,
    communityId: string,
    currLower: Date,
    upper: Date,
    hubBreadthThreshold: number,
  ): Promise<SysAdminHubMemberCountRow> {
    return ctx.issuer.public(ctx, async (tx) => {
      const rows = await tx.$queryRaw<{ n: number }[]>`
        WITH window_recipients AS (
          -- Per-sender DISTINCT recipient count over the parametric
          -- window. Same shape as the donation_recipients CTE in
          -- findMemberStats but window-clamped on both sides instead
          -- of tenure-clamped (upper only). Cannot reuse
          -- mv_user_transaction_daily because its per-day
          -- unique_counterparties does not compose into a window-wide
          -- DISTINCT (same recipient across multiple days would
          -- double-count under SUM).
          --
          -- Cross-community + burn-target guards mirror the defenses
          -- on mv_user_transaction_daily / v_transaction_comments so
          -- a system-target wallet (no user_id) does not silently
          -- inflate the recipient count.
          SELECT
            fw."user_id" AS user_id,
            COUNT(DISTINCT tw."user_id")::int AS unique_recipients
          FROM "t_transactions" t
          INNER JOIN "t_wallets" fw
            ON fw."id" = t."from"
            AND fw."community_id" = ${communityId}
          INNER JOIN "t_wallets" tw
            ON tw."id" = t."to"
            AND tw."user_id" IS NOT NULL
          WHERE t."reason" = 'DONATION'
            AND t."created_at" >= (${currLower}::date AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
            AND t."created_at" <  (${upper}::date     AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
            AND (tw."community_id" IS NULL OR tw."community_id" = fw."community_id")
          GROUP BY fw."user_id"
        )
        SELECT COUNT(*)::int AS n
        FROM window_recipients
        WHERE unique_recipients >= ${hubBreadthThreshold}
      `;
      return { count: rows[0]?.n ?? 0 };
    });
  }

  /**
   * All-time DONATION totals + the data window actually covered by the
   * MV for this community, clamped at `asOf` for historic-asOf
   * consistency. `max_chain_depth` reads the live
   * `t_transactions.chain_depth` column so the summary card surfaces
   * the literal deepest chain rather than a month-bucketed max.
   */
  async findAllTimeTotals(
    ctx: IContext,
    communityId: string,
    asOf: Date,
  ): Promise<SysAdminAllTimeTotalsRow> {
    return ctx.issuer.public(ctx, async (tx) => {
      const rows = await tx.$queryRaw<
        {
          total_donation_points: bigint;
          max_chain_depth: number | null;
          data_from: Date | null;
          data_to: Date | null;
        }[]
      >`
        WITH asof_bound AS (
          -- Same (asOf JST day + 1) clamp the other sysadmin queries
          -- use. Historic asOf must not count DONATION transactions
          -- or chain depths from dates past asOf; otherwise the
          -- summary card would mix the past-point view with whatever
          -- landed after, contradicting stageCounts.total /
          -- communityActivityRate which ARE clamped.
          SELECT (
            ((${asOf}::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo')::date + 1)
            AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC'
          ) AS upper_ts
        ),
        donation_totals AS (
          SELECT
            COALESCE(SUM(t."from_point_change"), 0)::bigint AS total_donation_points,
            MAX(t."chain_depth")::int AS max_chain_depth
          FROM "t_transactions" t
          INNER JOIN "t_wallets" fw
            ON fw."id" = t."from"
            AND fw."community_id" = ${communityId}
          CROSS JOIN asof_bound ab
          WHERE t."reason" = 'DONATION'
            AND t."created_at" < ab.upper_ts
        ),
        data_range AS (
          -- MV "date" column is a JST-encoded date; compare against
          -- the JST calendar date of asOf (ab.upper_ts is JST-midnight
          -- in naive UTC, so dropping back to ::date gives the JST
          -- day after asOf; exclusive less-than keeps the last
          -- included day as asOf).
          SELECT
            MIN("date") AS data_from,
            MAX("date") AS data_to
          FROM "mv_transaction_summary_daily", asof_bound
          WHERE "community_id" = ${communityId}
            AND "date" < ((${asOf}::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo')::date + 1)
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
