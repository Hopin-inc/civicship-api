import { injectable } from "tsyringe";
import { IContext } from "@/types/server";
import {
  SysAdminAllTimeTotalsRow,
  SysAdminChainDepthBucketRow,
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
          days_in: number;
          donation_out_months: number;
          donation_out_days: number;
          total_points_out: bigint;
          user_send_rate: number;
          unique_donation_recipients: number;
          donation_in_months: number;
          donation_in_days: number;
          total_points_in: bigint;
          unique_donation_senders: number;
          last_donation_day: Date | null;
          first_donation_day: Date | null;
          joined_at: Date;
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
        donation_activity AS (
          -- Per-(user, JST calendar day) DONATION activity: emits one
          -- row per day the user sent a DONATION, carrying both the
          -- aggregated points for that day and the day's JST month
          -- bucket. The final SELECT then derives:
          --   donation_out_months = COUNT(DISTINCT jst_month)
          --   donation_out_days   = COUNT(DISTINCT jst_day)
          --   total_points_out    = SUM(day_points_out)
          --
          -- This consolidates what used to be two parallel CTEs
          -- (donation_months + donation_days). Joining both into the
          -- final SELECT on user_id created an N×M cross product —
          -- COUNT(DISTINCT) was unaffected, but SUM(month_points_out)
          -- got inflated by M (= number of donation days), corrupting
          -- total_points_out and every downstream consumer
          -- (pointsContributionPct, sort orderings, etc.). Pre-
          -- aggregating per-day in a single CTE removes the cross
          -- product entirely and is also one fewer t_transactions
          -- scan since both old CTEs read the same rows.
          --
          -- JST date bucketing matches the rest of the query so
          -- daysIn / donationOutDays line up with the member-tenure
          -- boundary, and findActivitySnapshot / findPlatformTotals
          -- agree on what "as of asOf" includes.
          SELECT
            fw."user_id" AS user_id,
            (t."created_at" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo')::date AS jst_day,
            DATE_TRUNC(
              'month',
              (t."created_at" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo')
            ) AS jst_month,
            SUM(t."from_point_change") AS day_points_out
          FROM "t_transactions" t
          INNER JOIN "t_wallets" fw
            ON fw."id" = t."from"
            AND fw."community_id" = ${communityId}
          INNER JOIN members m ON m."user_id" = fw."user_id"
          CROSS JOIN asof_bound ab
          WHERE t."reason" = 'DONATION'
            AND t."created_at" < ab.upper_ts
          GROUP BY fw."user_id", jst_day, jst_month
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
          -- Self-donations (fw.user_id = tw.user_id) are excluded so
          -- the count matches the "distinct OTHER users" wording in
          -- SysAdminMemberRow.uniqueDonationRecipients — the wallet
          -- validator does not block same-user transfers, so the
          -- guard has to live here.
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
            AND tw."user_id" <> fw."user_id"
          INNER JOIN members m ON m."user_id" = fw."user_id"
          CROSS JOIN asof_bound ab
          WHERE t."reason" = 'DONATION'
            AND t."created_at" < ab.upper_ts
            AND (tw."community_id" IS NULL OR tw."community_id" = fw."community_id")
          GROUP BY fw."user_id"
        ),
        donation_received AS (
          -- Receiver-side counterpart to donation_activity. Per-(user,
          -- JST calendar day) DONATION-IN activity for each member of
          -- this community, with the day's points-in and the JST
          -- month bucket. Same single-CTE shape so the final SELECT
          -- can derive donation_in_months / donation_in_days /
          -- total_points_in without re-introducing the cross-product
          -- bug that motivated the donation_activity consolidation.
          --
          -- Scoping mirrors donation_activity / donation_recipients:
          --   - DONATION reason only (excludes burn / grant flows that
          --     are not part of the gift-economy ledger)
          --   - receiver wallet attached to this community so a member
          --     who received cross-community grants does not get
          --     incoming credit they cannot reciprocate
          --   - sender wallet either in this community or unattached
          --     (system / burn sources are excluded from the points
          --     sum for symmetry with donation_activity's wallet
          --     filter on the sending side)
          --   - clamped at asOf via asof_bound so a historic asOf
          --     does not leak future incoming points into the totals
          SELECT
            tw."user_id" AS user_id,
            (t."created_at" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo')::date AS jst_day,
            DATE_TRUNC(
              'month',
              (t."created_at" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo')
            ) AS jst_month,
            SUM(t."to_point_change") AS day_points_in
          FROM "t_transactions" t
          INNER JOIN "t_wallets" tw
            ON tw."id" = t."to"
            AND tw."community_id" = ${communityId}
          INNER JOIN members m ON m."user_id" = tw."user_id"
          INNER JOIN "t_wallets" fw
            ON fw."id" = t."from"
            AND fw."user_id" IS NOT NULL
            AND (fw."community_id" IS NULL OR fw."community_id" = tw."community_id")
          CROSS JOIN asof_bound ab
          WHERE t."reason" = 'DONATION'
            AND t."created_at" < ab.upper_ts
          GROUP BY tw."user_id", jst_day, jst_month
        ),
        donation_in_aggregates AS (
          -- Pre-aggregate donation_received to one row per user so the
          -- final SELECT can LEFT JOIN both donation_activity and
          -- this CTE without re-introducing the multi-row × multi-row
          -- cross product that the donation_activity consolidation
          -- comment warns about. donation_activity stays per-day
          -- because the final SELECT still uses
          -- COUNT(DISTINCT da.jst_month / da.jst_day) — those are
          -- cheap and unaffected by row multiplicity. The incoming
          -- side has no equivalent need; one row per user is all the
          -- final SELECT consumes.
          SELECT
            user_id,
            COUNT(DISTINCT jst_month)::int AS donation_in_months,
            COUNT(DISTINCT jst_day)::int AS donation_in_days,
            COALESCE(SUM(day_points_in), 0)::bigint AS total_points_in
          FROM donation_received
          GROUP BY user_id
        ),
        donation_senders AS (
          -- Receiver-side counterpart to donation_recipients. Per-
          -- recipient count of DISTINCT sender user_ids over the
          -- whole tenure (clamped at asOf). Backs
          -- SysAdminMemberRow.uniqueDonationSenders, which the L2
          -- dashboard uses to compute "受領→送付 転換率"
          -- (recipient-to-sender conversion rate).
          --
          -- Same defensive guards as donation_recipients in mirror:
          --   - sender wallet must have a user_id (no burn / system
          --     sources count toward sender breadth, otherwise an
          --     admin-issued bulk grant would inflate the count)
          --   - excludes self-donations (matches the "distinct OTHER
          --     users" wording in
          --     SysAdminMemberRow.uniqueDonationSenders)
          --   - sender wallet either in this community or unattached
          --     (no cross-community leakage)
          SELECT
            tw."user_id" AS user_id,
            COUNT(DISTINCT fw."user_id")::int AS unique_senders
          FROM "t_transactions" t
          INNER JOIN "t_wallets" tw
            ON tw."id" = t."to"
            AND tw."community_id" = ${communityId}
          INNER JOIN "t_wallets" fw
            ON fw."id" = t."from"
            AND fw."user_id" IS NOT NULL
            AND fw."user_id" <> tw."user_id"
          INNER JOIN members m ON m."user_id" = tw."user_id"
          CROSS JOIN asof_bound ab
          WHERE t."reason" = 'DONATION'
            AND t."created_at" < ab.upper_ts
            AND (fw."community_id" IS NULL OR fw."community_id" = tw."community_id")
          GROUP BY tw."user_id"
        ),
        member_tenure AS (
          -- Compute months_in / days_in ONCE per member so the
          -- final SELECT can reuse them as both raw fields and as
          -- the denominators of monthly / daily activity rates.
          --
          -- months_in: "distinct JST calendar months the member
          -- has been present in (join-month through asOf-month
          -- inclusive)" — the +1 turns the month-number diff into
          -- a span count, matching how donation_out_months
          -- (COUNT DISTINCT jst_month) counts.
          --
          -- days_in: "distinct JST calendar days the member has
          -- been present in" — same +1 inclusivity, matching how
          -- donation_out_days (COUNT DISTINCT jst_day) counts.
          --
          -- GREATEST(1, ...) defends against any future clock
          -- skew on both. Pulling the asOf-side conversion from
          -- asof_jst avoids re-running the double AT TIME ZONE
          -- cast once per row.
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
            )::int AS months_in,
            GREATEST(
              1,
              (
                (aj.ts::date - (m."created_at" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo')::date) + 1
              )
            )::int AS days_in
          FROM members m, asof_jst aj
        )
        SELECT
          m."user_id",
          u."name" AS "name",
          mt.months_in,
          mt.days_in,
          COALESCE(COUNT(DISTINCT da.jst_month), 0)::int AS donation_out_months,
          COALESCE(COUNT(DISTINCT da.jst_day), 0)::int AS donation_out_days,
          -- SUM is over per-day rows (one row per user per donation
          -- day in donation_activity). No cross product with another
          -- per-user-multi-row CTE, so each day's points are summed
          -- exactly once.
          COALESCE(SUM(da.day_points_out), 0)::bigint AS total_points_out,
          -- GREATEST(1, ...) inside member_tenure guarantees the
          -- divisor is >= 1; no zero branch needed around ROUND.
          ROUND(
            COALESCE(COUNT(DISTINCT da.jst_month), 0)::numeric
              / mt.months_in::numeric,
            3
          )::double precision AS user_send_rate,
          -- donation_recipients is pre-grouped by user_id, so each
          -- sender appears at most once on the right side of the
          -- LEFT JOIN. MAX() (rather than adding the column to GROUP
          -- BY) propagates that single value through the per-user
          -- grouping cleanly and matches the COALESCE/MAX pattern
          -- used elsewhere when joining a pre-aggregated CTE.
          COALESCE(MAX(dr.unique_recipients), 0)::int AS unique_donation_recipients,
          -- donation_in_aggregates is pre-grouped by user_id (one row
          -- per user), so each value comes through the per-user
          -- GROUP BY unchanged. MAX is structurally a no-op here and
          -- mirrors the COALESCE/MAX pattern used for donation_recipients
          -- and donation_senders below. Default 0 when the receiver
          -- has never received a DONATION (LEFT JOIN miss).
          COALESCE(MAX(dia.donation_in_months), 0)::int AS donation_in_months,
          COALESCE(MAX(dia.donation_in_days), 0)::int AS donation_in_days,
          COALESCE(MAX(dia.total_points_in), 0)::bigint AS total_points_in,
          COALESCE(MAX(ds.unique_senders), 0)::int AS unique_donation_senders,
          -- MAX over the per-(user, jst_day) rows in donation_activity
          -- gives the most recent JST day this user sent a DONATION.
          -- NULL when the LEFT JOIN found no donation_activity rows
          -- (= the member never donated, the latent case). The service
          -- layer derives dormantCount from this without re-scanning
          -- t_transactions.
          MAX(da.jst_day) AS last_donation_day,
          -- MIN over the same per-day rows is the FIRST DONATION day,
          -- powering the cohort funnel's activatedD30 stage in the
          -- service layer (member is "activated within 30 days" iff
          -- first_donation_day - joined_at < 30 days). Same NULL
          -- semantic as last_donation_day for never-donated members.
          MIN(da.jst_day) AS first_donation_day,
          -- t_memberships.created_at exposed verbatim so the cohort
          -- funnel can bucket members by their join month
          -- (DATE_TRUNC at the JST timezone in service-side TS).
          -- GROUP BY m."created_at" added below so the aggregate
          -- doesn't collapse it.
          m."created_at" AS joined_at
        FROM members m
        INNER JOIN member_tenure mt ON mt."user_id" = m."user_id"
        LEFT JOIN donation_activity da ON da.user_id = m."user_id"
        LEFT JOIN donation_recipients dr ON dr.user_id = m."user_id"
        LEFT JOIN donation_in_aggregates dia ON dia.user_id = m."user_id"
        LEFT JOIN donation_senders ds ON ds.user_id = m."user_id"
        LEFT JOIN "t_users" u ON u."id" = m."user_id"
        GROUP BY m."user_id", m."created_at", mt.months_in, mt.days_in, u."name"
        ORDER BY m."user_id"
      `;
      return rows.map((r) => ({
        userId: r.user_id,
        name: r.name,
        monthsIn: r.months_in,
        daysIn: r.days_in,
        donationOutMonths: r.donation_out_months,
        donationOutDays: r.donation_out_days,
        totalPointsOut: r.total_points_out,
        userSendRate: r.user_send_rate,
        uniqueDonationRecipients: r.unique_donation_recipients,
        donationInMonths: r.donation_in_months,
        donationInDays: r.donation_in_days,
        totalPointsIn: r.total_points_in,
        uniqueDonationSenders: r.unique_donation_senders,
        lastDonationDay: r.last_donation_day,
        firstDonationDay: r.first_donation_day,
        joinedAt: r.joined_at,
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
    hubBreadthThreshold: number,
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
          dormant_count_end_of_month: number;
          returned_members: number | null;
          hub_member_count: number;
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
        ),
        user_month_donations AS (
          -- Per (user, month_end) the user's latest DONATION-out
          -- day strictly before that month_end. Used by both
          -- dormant_counts (snapshot of who's gone quiet at
          -- month_end) and returned_counts (who came back this
          -- month vs prev month-end's dormant set).
          --
          -- Bounded scan over mv_user_transaction_daily cross-
          -- joined with the N month boundaries. At MAX_WINDOW_MONTHS
          -- (36) and a community with K donating members, this is
          -- 36 x K rows -- typical communities have ~10^2 donating
          -- users so the CTE stays well under 10^4 rows. The
          -- (community_id, date) index on the MV keeps the inner
          -- scan cheap.
          SELECT
            mb.month_start,
            mb.member_upper,
            mv."user_id",
            MAX(mv."date") AS last_donation_day
          FROM month_bounds mb
          INNER JOIN "mv_user_transaction_daily" mv
            ON mv."community_id" = ${communityId}
            AND mv."date" < mb.member_upper
            AND mv."donation_out_count" > 0
          GROUP BY mb.month_start, mb.member_upper, mv."user_id"
        ),
        dormant_counts AS (
          -- Snapshot of dormant members at each month-end. Mirrors
          -- the SysAdminCommunityOverview.dormantCount semantic
          -- (ever-donated AND last DONATION older than 30 days).
          -- The 30-day window is fixed here independent of the
          -- request's dormantThresholdDays so values across the
          -- monthly trend stay comparable across requests with
          -- different thresholds.
          --
          -- Membership filter mirrors member_counts so the
          -- dormant set only includes members still in the
          -- community at month-end (asOf-clamped via member_upper).
          -- The 30-day cutoff uses date arithmetic
          -- (member_upper - 30) so both sides of the inequality
          -- are dates, matching the MV "date" storage type and
          -- avoiding any timezone-cast cost in the comparison.
          SELECT
            umd.month_start,
            COUNT(DISTINCT umd."user_id")::int AS dormant_count
          FROM user_month_donations umd
          INNER JOIN "t_memberships" m
            ON m."community_id" = ${communityId}
            AND m."user_id" = umd."user_id"
            AND m."status" = 'JOINED'
            AND m."created_at" < (umd.member_upper AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
          WHERE umd.last_donation_day < (umd.member_upper - 30)
          GROUP BY umd.month_start
        ),
        returned_counts AS (
          -- Members who were dormant at the END of the previous
          -- month in the series AND had at least one DONATION out
          -- this month. Backs
          -- SysAdminMonthlyActivityPoint.returnedMembers.
          --
          -- The INNER JOIN on prev_mb (matched via
          -- prev_mb.next_month_start = mb.month_start) means the
          -- first month in the series emits no row -> the LEFT JOIN
          -- in the final SELECT resolves it to NULL, matching the
          -- "null for the first month" contract documented on the
          -- field. Reuses user_month_donations for the prev
          -- month's snapshot so the dormant predicate stays in one
          -- place; an extra MV scan over [month_start, member_upper)
          -- gates "this month had a DONATION out".
          SELECT
            mb.month_start,
            COUNT(DISTINCT mv."user_id")::int AS returned_count
          FROM month_bounds mb
          INNER JOIN month_bounds prev_mb
            ON prev_mb.next_month_start = mb.month_start
          INNER JOIN user_month_donations umd
            ON umd.month_start = prev_mb.month_start
            AND umd.last_donation_day < (prev_mb.member_upper - 30)
          INNER JOIN "t_memberships" m
            ON m."community_id" = ${communityId}
            AND m."user_id" = umd."user_id"
            AND m."status" = 'JOINED'
            AND m."created_at" < (prev_mb.member_upper AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
          INNER JOIN "mv_user_transaction_daily" mv
            ON mv."community_id" = ${communityId}
            AND mv."user_id" = umd."user_id"
            AND mv."date" >= mb.month_start
            AND mv."date" <  mb.member_upper
            AND mv."donation_out_count" > 0
          GROUP BY mb.month_start
        ),
        hub_per_month AS (
          -- Per (month_start, sender) DISTINCT recipient count over
          -- the trailing 28-day window ending at member_upper.
          -- Mirrors the L1 findWindowHubMemberCount query exactly
          -- (cross-community + burn-target guards via tw.user_id
          -- presence, self-donation excluded by tw.user_id <>
          -- fw.user_id, recipient-community guard via
          -- tw.community_id) but cross-joined with month_bounds so
          -- each transaction is evaluated against every month-end
          -- window it falls into. The 28-day window length is
          -- intentionally fixed (not request-driven) so monthly
          -- hub counts stay comparable across requests — same
          -- precedent as dormant_counts' fixed 30-day window.
          --
          -- Each transaction's created_at can satisfy at most two
          -- consecutive months' windows because windowDays (28) is
          -- shorter than any month-pair span (>= 59 days), so the
          -- cross join's row volume is bounded by
          -- ~2 × |DONATION tx in window| rather than N × |DONATION tx|.
          --
          -- Cannot reuse mv_user_transaction_daily here for the
          -- same reason as the L1 path: the MV's per-day
          -- unique_counterparties does not compose into a
          -- window-wide DISTINCT under SUM (same recipient across
          -- multiple days double-counts).
          --
          -- The t_memberships join restricts senders to users
          -- still JOINED in the community at member_upper. Mirrors
          -- the dormant_counts / returned_counts CTEs above and
          -- the L1 findWindowHubMemberCount query so a now-
          -- departed member who sent DONATIONs while a member
          -- doesn't get counted as a "current hub" in their
          -- former month — would otherwise contradict the
          -- L1==latest-month invariant once L1 also enforces
          -- this membership filter.
          SELECT
            mb.month_start,
            fw."user_id" AS user_id,
            COUNT(DISTINCT tw."user_id")::int AS unique_recipients
          FROM month_bounds mb
          INNER JOIN "t_transactions" t
            ON t."reason" = 'DONATION'
            AND t."created_at" >= ((mb.member_upper - 28) AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
            AND t."created_at" <  (mb.member_upper          AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
          INNER JOIN "t_wallets" fw
            ON fw."id" = t."from"
            AND fw."community_id" = ${communityId}
          INNER JOIN "t_memberships" m
            ON m."community_id" = ${communityId}
            AND m."user_id" = fw."user_id"
            AND m."status" = 'JOINED'
            AND m."created_at" <  (mb.member_upper AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
          INNER JOIN "t_wallets" tw
            ON tw."id" = t."to"
            AND tw."user_id" IS NOT NULL
            AND tw."user_id" <> fw."user_id"
            AND (tw."community_id" IS NULL OR tw."community_id" = fw."community_id")
          GROUP BY mb.month_start, fw."user_id"
        ),
        hub_counts AS (
          -- Apply the threshold filter and count distinct hub
          -- members per month. Members not in hub_per_month
          -- (= no DONATION-out at all in the window) are by
          -- construction below threshold and correctly excluded.
          SELECT
            month_start,
            COUNT(*)::int AS hub_member_count
          FROM hub_per_month
          WHERE unique_recipients >= ${hubBreadthThreshold}
          GROUP BY month_start
        ),
        first_month AS (
          -- Earliest month in the series. The CASE in the final
          -- SELECT uses this to force returned_members to NULL on
          -- the first row instead of returning a misleading 0
          -- (would imply "no returners", but actually means "no
          -- prior month to compare against").
          SELECT MIN(month_start) AS first_start FROM month_bounds
        )
        SELECT
          mb.month_start,
          COALESCE(s.sender_count, 0)::int AS sender_count,
          COALESCE(mc.total_members_end_of_month, 0)::int AS total_members_end_of_month,
          COALESCE(mc.new_members, 0)::int AS new_members,
          COALESCE(tt.donation_points_sum, 0)::bigint AS donation_points_sum,
          COALESCE(tt.donation_tx_count, 0)::bigint AS donation_tx_count,
          COALESCE(tt.donation_chain_tx_count, 0)::bigint AS donation_chain_tx_count,
          COALESCE(dc.dormant_count, 0)::int AS dormant_count_end_of_month,
          CASE
            WHEN mb.month_start = fm.first_start THEN NULL
            ELSE COALESCE(rc.returned_count, 0)::int
          END AS returned_members,
          COALESCE(hub.hub_member_count, 0)::int AS hub_member_count
        FROM month_bounds mb
        LEFT JOIN senders s USING (month_start)
        LEFT JOIN tx_totals tt USING (month_start)
        LEFT JOIN member_counts mc USING (month_start)
        LEFT JOIN dormant_counts dc USING (month_start)
        LEFT JOIN returned_counts rc USING (month_start)
        LEFT JOIN hub_counts hub USING (month_start)
        CROSS JOIN first_month fm
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
        dormantCountEndOfMonth: r.dormant_count_end_of_month,
        returnedMembers: r.returned_members,
        hubMemberCount: r.hub_member_count,
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
          --
          -- The INNER JOIN against t_memberships restricts the
          -- senders to users still JOINED in this community at
          -- "upper" (asOf+1 JST). Without this, a user who had a
          -- community wallet during the window but later left
          -- (status != 'JOINED' at asOf) would still be counted —
          -- the dashboard would surface a "former member" as a
          -- live sender, which contradicts the L1 invariant
          -- "senderCount <= totalMembers" (totalMembers already
          -- enforces JOINED-at-asOf via findActivitySnapshot). The
          -- t_memberships scan is cheap because the
          -- (community_id, user_id, status) index narrows it to
          -- the same row count as t_wallets for the community.
          SELECT
            mv."user_id",
            bool_or(mv."date" >= ${currLower}::date AND mv."date" <  ${upper}::date) AS in_curr,
            bool_or(mv."date" >= ${prevLower}::date AND mv."date" <  ${currLower}::date) AS in_prev
          FROM "mv_user_transaction_daily" mv
          INNER JOIN "t_memberships" m
            ON m."community_id" = ${communityId}
            AND m."user_id" = mv."user_id"
            AND m."status" = 'JOINED'
            AND m."created_at" <  (${upper}::date AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
          WHERE mv."community_id" = ${communityId}
            AND mv."donation_out_count" > 0
            AND mv."date" >= ${prevLower}::date
            AND mv."date" <  ${upper}::date
          GROUP BY mv."user_id"
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
          -- inflate the recipient count. Self-donations are excluded
          -- (matches the "different people" wording in
          -- SysAdminCommunityOverview.hubMemberCount and the
          -- "distinct OTHER users" definition in
          -- SysAdminMemberRow.uniqueDonationRecipients) — the wallet
          -- validator does not block same-user transfers, so the
          -- guard has to live in this query.
          --
          -- The t_memberships join restricts senders to users
          -- still JOINED in this community at "upper" (asOf+1
          -- JST). Without it, a now-departed member who sent
          -- DONATIONs while a member would still get counted as
          -- a "current hub", contradicting the
          -- "hubMemberCount <= senderCount <= totalMembers"
          -- invariant documented on SysAdminCommunityOverview.
          SELECT
            fw."user_id" AS user_id,
            COUNT(DISTINCT tw."user_id")::int AS unique_recipients
          FROM "t_transactions" t
          INNER JOIN "t_wallets" fw
            ON fw."id" = t."from"
            AND fw."community_id" = ${communityId}
          INNER JOIN "t_memberships" m
            ON m."community_id" = ${communityId}
            AND m."user_id" = fw."user_id"
            AND m."status" = 'JOINED'
            AND m."created_at" <  (${upper}::date AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
          INNER JOIN "t_wallets" tw
            ON tw."id" = t."to"
            AND tw."user_id" IS NOT NULL
            AND tw."user_id" <> fw."user_id"
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

  async findChainDepthDistribution(
    ctx: IContext,
    communityId: string,
    asOf: Date,
    maxBucketDepth: number,
  ): Promise<SysAdminChainDepthBucketRow[]> {
    return ctx.issuer.public(ctx, async (tx) => {
      // generate_series produces depth 1..maxBucketDepth so the
      // returned array always has a stable shape (every bucket
      // emitted, count = 0 for empty depths) regardless of
      // community size or chain-population. The LEFT JOIN against
      // the per-tx aggregation collapses chain_depth >=
      // maxBucketDepth into the final bucket via LEAST.
      //
      // Sender-side guards mirror findWindowHubMemberCount:
      // sender wallet must be in this community, and we filter to
      // reason='DONATION'. No recipient-side or membership filter
      // is applied because chainDepthDistribution describes the
      // structure of the donation graph itself (how deep do
      // chains propagate?), not the current member roster — a
      // chain-depth-3 transaction from a now-departed member is
      // still a real chain-depth-3 event in the historic graph,
      // and excluding it would distort the histogram's shape.
      //
      // The asof_bound CTE clamps t.created_at at the JST-day-end
      // following asOf (= asOf JST day + 1 at JST midnight,
      // expressed as naive UTC). Mirrors the upper-bound pattern
      // used by findMemberStats / findAllTimeTotals so
      // maxChainDepthAllTime (read from findAllTimeTotals) and
      // chainDepthDistribution agree on which transactions are
      // "all-time as of asOf" — without this clamp a transaction
      // landing between asOf and JST-day-end would inflate
      // maxChainDepthAllTime but be missed by the histogram, an
      // off-by-one inconsistency within a single L2 payload.
      const rows = await tx.$queryRaw<{ depth: number; count: number }[]>`
        WITH asof_bound AS (
          SELECT
            (
              ((${asOf}::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo')::date + 1)
              AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC'
            ) AS upper_ts
        ),
        bucket_keys AS (
          SELECT generate_series(1, ${maxBucketDepth}::int) AS depth
        ),
        depth_counts AS (
          -- GROUP BY uses positional reference (1) rather than
          -- repeating the LEAST(...) expression. Prisma assigns a
          -- new bind parameter to every Prisma substitution slot,
          -- so writing the same LEAST(...) expression twice (once
          -- in SELECT, once in GROUP BY) yields two different
          -- parameter slots ($1, $3) at the wire level. PostgreSQL
          -- then refuses to recognise the GROUP BY expression as
          -- matching the SELECT one syntactically, raising
          -- "column t.chain_depth must appear in the GROUP BY
          -- clause". Positional GROUP BY sidesteps the parameter
          -- duplication entirely.
          SELECT
            LEAST(t."chain_depth", ${maxBucketDepth}::int) AS depth,
            COUNT(*)::int AS n
          FROM "t_transactions" t
          INNER JOIN "t_wallets" fw
            ON fw."id" = t."from"
            AND fw."community_id" = ${communityId}
          CROSS JOIN asof_bound ab
          WHERE t."reason" = 'DONATION'
            AND t."chain_depth" >= 1
            AND t."created_at" < ab.upper_ts
          GROUP BY 1
        )
        SELECT
          bk.depth AS depth,
          COALESCE(dc.n, 0)::int AS count
        FROM bucket_keys bk
        LEFT JOIN depth_counts dc USING (depth)
        ORDER BY bk.depth ASC
      `;
      return rows.map((r) => ({ depth: r.depth, count: r.count }));
    });
  }
}
