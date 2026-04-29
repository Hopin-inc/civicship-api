import { injectable } from "tsyringe";
import { IContext } from "@/types/server";
import {
  AnalyticsAllTimeTotalsRow,
  AnalyticsChainDepthBucketRow,
  AnalyticsCommunityRow,
  AnalyticsMemberStatsRow,
  AnalyticsActivitySnapshotRow,
  AnalyticsMonthlyActivityRow,
  AnalyticsHubMemberCountRow,
  AnalyticsNewMemberCountRow,
  AnalyticsWindowActivityCountsRow,
} from "@/application/domain/analytics/community/data/type";
import { IAnalyticsCommunityRepository } from "@/application/domain/analytics/community/data/interface";

/**
 * SQL helpers for the analytics community surface.
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
export default class AnalyticsCommunityRepository implements IAnalyticsCommunityRepository {
  async findAllCommunities(ctx: IContext): Promise<AnalyticsCommunityRow[]> {
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
  ): Promise<AnalyticsCommunityRow | null> {
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
   * Per-member LTV-variable counters at `asOf` for every community in
   * `communityIds`, returned as `Map<communityId, rows[]>` pre-seeded
   * with empty arrays so the caller can iterate `communityIds` without
   * null-checking.
   *
   * Scoped to `status='JOINED'`. A member with zero DONATION-outs is
   * still present (donationOutMonths=0, userSendRate=0, latent stage).
   * `months_in` is the JST-calendar-month difference (floor, minimum
   * 1) so a member who joined today and a member who joined earlier
   * this month both get `months_in = 1` — tenure is in completed-month
   * units, not days. `user_send_rate` is emitted already-rounded to
   * 3dp so the presenter stays a pure shape-mapper.
   *
   * Every CTE joins on `(user_id, community_id)` so a user who is a
   * member of multiple communities is bucketed into the right one.
   * Cross-community leakage guards (`tw.community_id IS NULL OR
   * tw.community_id = fw.community_id`) reference the sender wallet's
   * community, which is correctly scoped per row.
   */
  async findMemberStatsBulk(
    ctx: IContext,
    communityIds: string[],
    asOf: Date,
  ): Promise<Map<string, AnalyticsMemberStatsRow[]>> {
    const out = new Map<string, AnalyticsMemberStatsRow[]>();
    for (const id of communityIds) out.set(id, []);
    if (communityIds.length === 0) return out;
    return ctx.issuer.public(ctx, async (tx) => {
      const rows = await tx.$queryRaw<
        {
          community_id: string;
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
          -- Derive the "asOf JST day + 1" once and reuse everywhere
          -- the query wants an exclusive upper bound. upper_ts is
          -- the naive-UTC encoding for comparisons against
          -- t_*.created_at columns; upper_jst_date is the bare
          -- JST date for comparisons against mv_donation_tx_edges.date
          -- (and any other JST-bucketed @db.Date column). The
          -- expression is the same JST-day clamp findActivitySnapshot
          -- / findMonthlyActivity receive pre-computed from the
          -- service layer; inlining it into a single CTE here keeps
          -- the signature unchanged without duplicating the double
          -- AT TIME ZONE dance across multiple WHERE clauses.
          SELECT
            ((ts::date + 1) AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC') AS upper_ts,
            (ts::date + 1)                                                AS upper_jst_date
          FROM asof_jst
        ),
        members AS (
          -- Filter to members whose membership existed at asOf, in any
          -- of the requested communities. Without this, a historic
          -- asOf would include members who joined after that point,
          -- inflating stageCounts.total, polluting stage classification,
          -- and leaking future members into the paginated list.
          -- findActivitySnapshot already scopes total_members this way;
          -- mirroring it keeps the activity rate denominator consistent
          -- with stageCounts.total. community_id is carried through
          -- so the per-user JOIN keys downstream stay correctly bucketed
          -- when a single user is a member of multiple communities.
          SELECT
            m."community_id",
            m."user_id",
            m."created_at"
          FROM "t_memberships" m, asof_bound ab
          WHERE m."community_id" = ANY(${communityIds}::text[])
            AND m."status" = 'JOINED'
            AND m."created_at" < ab.upper_ts
        ),
        donation_activity AS (
          -- Per-(community, user, JST calendar day) DONATION activity:
          -- emits one row per day the user sent a DONATION from their
          -- wallet in that community, carrying both the aggregated
          -- points for that day and the day's JST month bucket. The
          -- final SELECT then derives:
          --   donation_out_months = COUNT(DISTINCT jst_month)
          --   donation_out_days   = COUNT(DISTINCT jst_day)
          --   total_points_out    = SUM(day_points_out)
          --
          -- Sources from mv_donation_tx_edges. The MV bakes in three
          -- guards that match civicship's gift-economy DONATION
          -- definition and so are correct for every analytics caller,
          -- including this one:
          --   - tw.user_id IS NOT NULL — DONATIONs to burn / system
          --     wallets are not peer-to-peer gifts
          --   - tw.user_id <> fw.user_id — self-donations are not
          --     gifts
          --   - cross-community guard — DONATION rows where both sides
          --     have non-NULL communities and they differ are
          --     cross-community leakage and shouldn't be credited to
          --     either community's totals
          -- The pre-PR donation_activity CTE happened not to apply
          -- these because it never JOINed the recipient wallet, but
          -- that was an implicit reliance on the data not containing
          -- such rows. Making the contract explicit at the MV layer
          -- removes the ambiguity for every consumer.
          --
          -- JST date bucketing matches the rest of the query so
          -- daysIn / donationOutDays line up with the member-tenure
          -- boundary, and findActivitySnapshot / findPlatformTotals
          -- agree on what "as of asOf" includes.
          SELECT
            e."sender_community_id" AS community_id,
            e."sender_user_id" AS user_id,
            e."date" AS jst_day,
            DATE_TRUNC('month', e."date") AS jst_month,
            SUM(e."from_point_change") AS day_points_out
          FROM "mv_donation_tx_edges" e
          INNER JOIN members m
            ON m."user_id" = e."sender_user_id"
            AND m."community_id" = e."sender_community_id"
          CROSS JOIN asof_bound ab
          WHERE e."sender_community_id" = ANY(${communityIds}::text[])
            AND e."date" < ab.upper_jst_date
          -- jst_month is functionally dependent on e."date" (DATE_TRUNC
          -- output) and Postgres allows it in SELECT without an
          -- explicit GROUP BY entry, but listing it keeps the GROUP BY
          -- shape parallel to the pre-PR inline CTE and removes the
          -- reliance on functional-dependency analysis.
          GROUP BY e."sender_community_id", e."sender_user_id", e."date", jst_month
        ),
        donation_recipients AS (
          -- Per-sender count of DISTINCT recipient user_ids over the
          -- whole tenure (clamped at asOf). This is the "network
          -- breadth" half of the donor profile and cannot be derived
          -- from mv_user_transaction_daily — that MV's
          -- unique_counterparties column is per-day and does not
          -- compose into an all-time DISTINCT under SUM (same recipient
          -- across multiple days would double-count).
          --
          -- Sources from mv_donation_tx_edges. The MV bakes in:
          --   - DONATION reason
          --   - cross-community guard (recipient in same community or
          --     unattached)
          --   - burn-target / system-target exclusion (tw.user_id NOT
          --     NULL)
          --   - self-donation exclusion (sender_user_id <>
          --     recipient_user_id)
          -- so this CTE just keys by sender_community_id and
          -- clamps at asOf.
          SELECT
            e."sender_community_id" AS community_id,
            e."sender_user_id" AS user_id,
            COUNT(DISTINCT e."recipient_user_id")::int AS unique_recipients
          FROM "mv_donation_tx_edges" e
          INNER JOIN members m
            ON m."user_id" = e."sender_user_id"
            AND m."community_id" = e."sender_community_id"
          CROSS JOIN asof_bound ab
          WHERE e."sender_community_id" = ANY(${communityIds}::text[])
            AND e."date" < ab.upper_jst_date
          GROUP BY e."sender_community_id", e."sender_user_id"
        ),
        donation_received AS (
          -- Receiver-side counterpart to donation_activity. Per-
          -- (community, user, JST calendar day) DONATION-IN activity
          -- for each member of the requested communities, with the
          -- day's points-in and the JST month bucket. Same single-CTE
          -- shape so the final SELECT can derive donation_in_months /
          -- donation_in_days / total_points_in without re-introducing
          -- the cross-product bug that motivated the donation_activity
          -- consolidation.
          --
          -- Sources from mv_donation_tx_edges, keyed by
          -- recipient_community_id. Same "the MV's three guards
          -- match civicship's DONATION definition" reasoning as
          -- donation_activity above — burn-target / self-donation /
          -- cross-community-leakage rows are not real peer-to-peer
          -- gifts and so should not contribute to a member's
          -- incoming totals either.
          SELECT
            e."recipient_community_id" AS community_id,
            e."recipient_user_id" AS user_id,
            e."date" AS jst_day,
            DATE_TRUNC('month', e."date") AS jst_month,
            SUM(e."to_point_change") AS day_points_in
          FROM "mv_donation_tx_edges" e
          INNER JOIN members m
            ON m."user_id" = e."recipient_user_id"
            AND m."community_id" = e."recipient_community_id"
          CROSS JOIN asof_bound ab
          WHERE e."recipient_community_id" = ANY(${communityIds}::text[])
            AND e."date" < ab.upper_jst_date
          -- See donation_activity above: jst_month listed explicitly
          -- in GROUP BY for SELECT-list parity rather than relying on
          -- functional-dependency analysis.
          GROUP BY e."recipient_community_id", e."recipient_user_id", e."date", jst_month
        ),
        donation_in_aggregates AS (
          -- Pre-aggregate donation_received to one row per
          -- (community, user) so the final SELECT can LEFT JOIN both
          -- donation_activity and this CTE without re-introducing the
          -- multi-row × multi-row cross product that the
          -- donation_activity consolidation comment warns about.
          -- donation_activity stays per-day because the final SELECT
          -- still uses COUNT(DISTINCT da.jst_month / da.jst_day) —
          -- those are cheap and unaffected by row multiplicity. The
          -- incoming side has no equivalent need; one row per
          -- (community, user) is all the final SELECT consumes.
          SELECT
            community_id,
            user_id,
            COUNT(DISTINCT jst_month)::int AS donation_in_months,
            COUNT(DISTINCT jst_day)::int AS donation_in_days,
            COALESCE(SUM(day_points_in), 0)::bigint AS total_points_in
          FROM donation_received
          GROUP BY community_id, user_id
        ),
        donation_senders AS (
          -- Receiver-side counterpart to donation_recipients. Per-
          -- recipient count of DISTINCT sender user_ids over the
          -- whole tenure (clamped at asOf). Backs
          -- AnalyticsMemberRow.uniqueDonationSenders, which the L2
          -- dashboard uses to compute "受領→送付 転換率"
          -- (recipient-to-sender conversion rate).
          --
          -- Sources from mv_donation_tx_edges, keyed by
          -- recipient_community_id. The MV bakes in the same defensive
          -- guards as the previous inline CTE:
          --   - DONATION reason
          --   - sender wallet has a user_id (burn / system sources
          --     excluded so a bulk admin grant doesn't inflate sender
          --     breadth)
          --   - self-donation exclusion (sender_user_id <>
          --     recipient_user_id)
          --   - cross-community guard (sender community NULL or
          --     matches recipient)
          SELECT
            e."recipient_community_id" AS community_id,
            e."recipient_user_id" AS user_id,
            COUNT(DISTINCT e."sender_user_id")::int AS unique_senders
          FROM "mv_donation_tx_edges" e
          INNER JOIN members m
            ON m."user_id" = e."recipient_user_id"
            AND m."community_id" = e."recipient_community_id"
          CROSS JOIN asof_bound ab
          WHERE e."recipient_community_id" = ANY(${communityIds}::text[])
            AND e."date" < ab.upper_jst_date
          GROUP BY e."recipient_community_id", e."recipient_user_id"
        ),
        member_tenure AS (
          -- Compute months_in / days_in ONCE per (community, member)
          -- so the final SELECT can reuse them as both raw fields and
          -- as the denominators of monthly / daily activity rates.
          --
          -- months_in: "distinct JST calendar months the member has
          -- been present in (join-month through asOf-month
          -- inclusive)" — the +1 turns the month-number diff into a
          -- span count, matching how donation_out_months
          -- (COUNT DISTINCT jst_month) counts.
          --
          -- days_in: "distinct JST calendar days the member has been
          -- present in" — same +1 inclusivity, matching how
          -- donation_out_days (COUNT DISTINCT jst_day) counts.
          --
          -- GREATEST(1, ...) defends against any future clock skew on
          -- both. Pulling the asOf-side conversion from asof_jst
          -- avoids re-running the double AT TIME ZONE cast once per
          -- row.
          SELECT
            m."community_id",
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
          m."community_id" AS community_id,
          m."user_id",
          u."name" AS "name",
          mt.months_in,
          mt.days_in,
          COALESCE(COUNT(DISTINCT da.jst_month), 0)::int AS donation_out_months,
          COALESCE(COUNT(DISTINCT da.jst_day), 0)::int AS donation_out_days,
          -- SUM is over per-day rows (one row per (community, user)
          -- per donation day in donation_activity). No cross product
          -- with another per-user-multi-row CTE, so each day's points
          -- are summed exactly once.
          COALESCE(SUM(da.day_points_out), 0)::bigint AS total_points_out,
          -- GREATEST(1, ...) inside member_tenure guarantees the
          -- divisor is >= 1; no zero branch needed around ROUND.
          ROUND(
            COALESCE(COUNT(DISTINCT da.jst_month), 0)::numeric
              / mt.months_in::numeric,
            3
          )::double precision AS user_send_rate,
          -- donation_recipients is pre-grouped by (community, user),
          -- so each sender appears at most once on the right side of
          -- the LEFT JOIN. MAX() (rather than adding the column to
          -- GROUP BY) propagates that single value through the
          -- per-user grouping cleanly and matches the COALESCE/MAX
          -- pattern used elsewhere when joining a pre-aggregated CTE.
          COALESCE(MAX(dr.unique_recipients), 0)::int AS unique_donation_recipients,
          -- donation_in_aggregates is pre-grouped by (community,
          -- user) (one row per pair), so each value comes through
          -- the per-user GROUP BY unchanged. MAX is structurally a
          -- no-op here and mirrors the COALESCE/MAX pattern used for
          -- donation_recipients and donation_senders below. Default
          -- 0 when the receiver has never received a DONATION (LEFT
          -- JOIN miss).
          COALESCE(MAX(dia.donation_in_months), 0)::int AS donation_in_months,
          COALESCE(MAX(dia.donation_in_days), 0)::int AS donation_in_days,
          COALESCE(MAX(dia.total_points_in), 0)::bigint AS total_points_in,
          COALESCE(MAX(ds.unique_senders), 0)::int AS unique_donation_senders,
          -- MAX over the per-(community, user, jst_day) rows in
          -- donation_activity gives the most recent JST day this user
          -- sent a DONATION. NULL when the LEFT JOIN found no
          -- donation_activity rows (= the member never donated, the
          -- latent case). The service layer derives dormantCount
          -- from this without re-scanning t_transactions.
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
        INNER JOIN member_tenure mt
          ON mt."user_id" = m."user_id"
          AND mt."community_id" = m."community_id"
        LEFT JOIN donation_activity da
          ON da.user_id = m."user_id"
          AND da.community_id = m."community_id"
        LEFT JOIN donation_recipients dr
          ON dr.user_id = m."user_id"
          AND dr.community_id = m."community_id"
        LEFT JOIN donation_in_aggregates dia
          ON dia.user_id = m."user_id"
          AND dia.community_id = m."community_id"
        LEFT JOIN donation_senders ds
          ON ds.user_id = m."user_id"
          AND ds.community_id = m."community_id"
        LEFT JOIN "t_users" u ON u."id" = m."user_id"
        GROUP BY m."community_id", m."user_id", m."created_at", mt.months_in, mt.days_in, u."name"
        ORDER BY m."community_id", m."user_id"
      `;
      for (const r of rows) {
        const bucket = out.get(r.community_id);
        if (!bucket) continue;
        bucket.push({
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
        });
      }
      return out;
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
  ): Promise<AnalyticsMonthlyActivityRow[]> {
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
            -- the clamp findMemberStatsBulk / findActivitySnapshot already
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
          -- the AnalyticsCommunityOverview.dormantCount semantic
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
          -- AnalyticsMonthlyActivityPoint.returnedMembers.
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
          -- Cross-joined with month_bounds so each DONATION edge is
          -- evaluated against every month-end window it falls into.
          -- The 28-day window length is intentionally fixed (not
          -- request-driven) so monthly hub counts stay comparable
          -- across requests — same precedent as dormant_counts' fixed
          -- 30-day window.
          --
          -- Each edge's date can satisfy at most two consecutive
          -- months' windows because windowDays (28) is shorter than
          -- any month-pair span (>= 59 days), so the cross join's
          -- row volume is bounded by ~2 × |DONATION edges in window|.
          --
          -- Sources from mv_donation_tx_edges (the tx-level normalized
          -- DONATION fact view). The MV bakes in the cross-community
          -- guard, the burn-target / self-donation exclusions, and
          -- the wallet -> user/community resolution — replacing the
          -- per-request t_transactions scan + double t_wallets JOIN
          -- the previous version of this CTE issued. Cannot reuse
          -- mv_user_transaction_daily here because its per-day
          -- unique_counterparties does not compose into a
          -- window-wide DISTINCT under SUM.
          --
          -- The t_memberships join restricts senders to users still
          -- JOINED in the community at member_upper. Mirrors
          -- dormant_counts / returned_counts CTEs above and the L1
          -- findWindowHubMemberCountBulk query so a now-departed
          -- member who sent DONATIONs while a member doesn't get
          -- counted as a "current hub" in their former month — would
          -- otherwise contradict the L1==latest-month invariant.
          SELECT
            mb.month_start,
            e."sender_user_id" AS user_id,
            COUNT(DISTINCT e."recipient_user_id")::int AS unique_recipients
          FROM month_bounds mb
          INNER JOIN "mv_donation_tx_edges" e
            ON e."sender_community_id" = ${communityId}
            AND e."date" >= (mb.member_upper - 28)
            AND e."date" <  mb.member_upper
          INNER JOIN "t_memberships" m
            ON m."community_id" = ${communityId}
            AND m."user_id" = e."sender_user_id"
            AND m."status" = 'JOINED'
            AND m."created_at" <  (mb.member_upper AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
          GROUP BY mb.month_start, e."sender_user_id"
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
  ): Promise<AnalyticsActivitySnapshotRow> {
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
  ): Promise<AnalyticsNewMemberCountRow> {
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
   * All five raw counts the L1 `AnalyticsWindowActivity` payload needs
   * for the parametric window pair driven by `windowDays`, computed for
   * every community in `communityIds` in one SQL roundtrip. Returns
   * `Map<communityId, counts>` pre-seeded with zero-row defaults so the
   * caller can iterate `communityIds` without null-checking.
   *
   * The SQL issues two scans: one over `mv_user_transaction_daily`
   * spanning `[prevLower, upper)` collapsed by FILTER clauses into
   * curr/prev/intersection counts, and one over `t_memberships` over
   * the same span split into curr/prev new-member counts.
   */
  async findWindowActivityCountsBulk(
    ctx: IContext,
    communityIds: string[],
    prevLower: Date,
    currLower: Date,
    upper: Date,
  ): Promise<Map<string, AnalyticsWindowActivityCountsRow>> {
    const empty = (): AnalyticsWindowActivityCountsRow => ({
      senderCount: 0,
      senderCountPrev: 0,
      retainedSenders: 0,
      newMemberCount: 0,
      newMemberCountPrev: 0,
    });
    const out = new Map<string, AnalyticsWindowActivityCountsRow>();
    for (const id of communityIds) out.set(id, empty());
    if (communityIds.length === 0) return out;
    return ctx.issuer.public(ctx, async (tx) => {
      const rows = await tx.$queryRaw<
        {
          community_id: string;
          curr_sender_count: number;
          prev_sender_count: number;
          retained_count: number;
          curr_new_member_count: number;
          prev_new_member_count: number;
        }[]
      >`
        WITH window_senders AS (
          -- One MV scan over [prevLower, upper). Per-(community, user)
          -- aggregation collapses each user's daily rows into two
          -- booleans recording whether they sent a DONATION in the
          -- current / previous window. The outer FILTER clauses then
          -- count senders, prev-senders, and the intersection
          -- (retained) without rescanning the MV.
          --
          -- The INNER JOIN against t_memberships restricts the
          -- senders to users still JOINED in their respective
          -- communities at "upper" (asOf+1 JST). Without this, a user
          -- who had a community wallet during the window but later
          -- left (status != 'JOINED' at asOf) would still be counted —
          -- the dashboard would surface a "former member" as a live
          -- sender, which contradicts the L1 invariant
          -- "senderCount <= totalMembers" (totalMembers already
          -- enforces JOINED-at-asOf via findActivitySnapshot). The
          -- t_memberships scan is cheap because the
          -- (community_id, user_id, status) index narrows it to the
          -- same row count as t_wallets for each community.
          SELECT
            mv."community_id",
            mv."user_id",
            bool_or(mv."date" >= ${currLower}::date AND mv."date" <  ${upper}::date) AS in_curr,
            bool_or(mv."date" >= ${prevLower}::date AND mv."date" <  ${currLower}::date) AS in_prev
          FROM "mv_user_transaction_daily" mv
          INNER JOIN "t_memberships" m
            ON m."community_id" = mv."community_id"
            AND m."user_id" = mv."user_id"
            AND m."status" = 'JOINED'
            AND m."created_at" <  (${upper}::date AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
          WHERE mv."community_id" = ANY(${communityIds}::text[])
            AND mv."donation_out_count" > 0
            AND mv."date" >= ${prevLower}::date
            AND mv."date" <  ${upper}::date
          GROUP BY mv."community_id", mv."user_id"
        ),
        sender_aggregates AS (
          SELECT
            "community_id",
            COUNT(*) FILTER (WHERE in_curr)::int                AS curr_sender_count,
            COUNT(*) FILTER (WHERE in_prev)::int                AS prev_sender_count,
            COUNT(*) FILTER (WHERE in_curr AND in_prev)::int    AS retained_count
          FROM window_senders
          GROUP BY "community_id"
        ),
        new_members AS (
          -- One t_memberships scan over [prevLower, upper). Same
          -- FILTER pattern: split current vs previous in one pass,
          -- grouped by community.
          SELECT
            "community_id",
            COUNT(*) FILTER (
              WHERE "created_at" >= (${currLower}::date AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
                AND "created_at" <  (${upper}::date     AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
            )::int AS curr_new_member_count,
            COUNT(*) FILTER (
              WHERE "created_at" >= (${prevLower}::date AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
                AND "created_at" <  (${currLower}::date AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
            )::int AS prev_new_member_count
          FROM "t_memberships"
          WHERE "community_id" = ANY(${communityIds}::text[])
            AND "status" = 'JOINED'
            AND "created_at" >= (${prevLower}::date AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
            AND "created_at" <  (${upper}::date     AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
          GROUP BY "community_id"
        ),
        community_keys AS (
          -- Materialise the input id list so the final LEFT JOIN
          -- emits one row per requested community, even those with no
          -- senders / no new members in the window. Without this, the
          -- caller would have to null-check every Map.get(id) lookup.
          SELECT unnest(${communityIds}::text[]) AS community_id
        )
        SELECT
          ck."community_id"                       AS community_id,
          COALESCE(s.curr_sender_count, 0)        AS curr_sender_count,
          COALESCE(s.prev_sender_count, 0)        AS prev_sender_count,
          COALESCE(s.retained_count, 0)           AS retained_count,
          COALESCE(n.curr_new_member_count, 0)    AS curr_new_member_count,
          COALESCE(n.prev_new_member_count, 0)    AS prev_new_member_count
        FROM community_keys ck
        LEFT JOIN sender_aggregates s ON s."community_id" = ck."community_id"
        LEFT JOIN new_members n      ON n."community_id" = ck."community_id"
      `;
      for (const r of rows) {
        out.set(r.community_id, {
          senderCount: r.curr_sender_count ?? 0,
          senderCountPrev: r.prev_sender_count ?? 0,
          retainedSenders: r.retained_count ?? 0,
          newMemberCount: r.curr_new_member_count ?? 0,
          newMemberCountPrev: r.prev_new_member_count ?? 0,
        });
      }
      return out;
    });
  }

  /**
   * Per-community count of members whose distinct DONATION recipient
   * count within `[currLower, upper)` reaches `hubBreadthThreshold`,
   * returned as `Map<communityId, {count}>` pre-seeded with count=0 for
   * every requested community. Backs
   * `AnalyticsCommunityOverview.hubMemberCount`.
   *
   * The recipient count is computed against `t_transactions` directly
   * (not `mv_user_transaction_daily`) because the MV's per-day
   * `unique_counterparties` does not compose into a window-wide
   * DISTINCT — the same recipient across multiple days would
   * double-count under SUM. Senders are restricted to users still
   * JOINED in this community at `upper` so the L1 invariant
   * `hubMemberCount <= senderCount <= totalMembers` holds.
   */
  async findWindowHubMemberCountBulk(
    ctx: IContext,
    communityIds: string[],
    currLower: Date,
    upper: Date,
    hubBreadthThreshold: number,
  ): Promise<Map<string, AnalyticsHubMemberCountRow>> {
    const out = new Map<string, AnalyticsHubMemberCountRow>();
    for (const id of communityIds) out.set(id, { count: 0 });
    if (communityIds.length === 0) return out;
    return ctx.issuer.public(ctx, async (tx) => {
      const rows = await tx.$queryRaw<{ community_id: string; n: number }[]>`
        WITH window_recipients AS (
          -- Per-(community, sender) DISTINCT recipient count over the
          -- parametric window. Sources from mv_donation_tx_edges (the
          -- tx-level normalized DONATION fact view), which bakes in
          -- the wallet -> user/community resolution, the cross-
          -- community guard, the burn-target exclusion, and the
          -- self-donation exclusion. That replaces the per-request
          -- t_transactions scan + double t_wallets JOIN this query
          -- previously issued. Cannot reuse mv_user_transaction_daily
          -- because its per-day unique_counterparties does not compose
          -- into a window-wide DISTINCT under SUM.
          --
          -- The t_memberships join restricts senders to users still
          -- JOINED in their respective communities at "upper" (asOf+1
          -- JST). Without it, a now-departed member who sent
          -- DONATIONs while a member would still get counted as a
          -- "current hub", contradicting the
          -- "hubMemberCount <= senderCount <= totalMembers" invariant
          -- documented on AnalyticsCommunityOverview.
          SELECT
            e."sender_community_id" AS community_id,
            e."sender_user_id" AS user_id,
            COUNT(DISTINCT e."recipient_user_id")::int AS unique_recipients
          FROM "mv_donation_tx_edges" e
          INNER JOIN "t_memberships" m
            ON m."community_id" = e."sender_community_id"
            AND m."user_id" = e."sender_user_id"
            AND m."status" = 'JOINED'
            AND m."created_at" <  (${upper}::date AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
          WHERE e."sender_community_id" = ANY(${communityIds}::text[])
            AND e."date" >= ${currLower}::date
            AND e."date" <  ${upper}::date
          GROUP BY e."sender_community_id", e."sender_user_id"
        )
        SELECT community_id, COUNT(*)::int AS n
        FROM window_recipients
        WHERE unique_recipients >= ${hubBreadthThreshold}
        GROUP BY community_id
      `;
      for (const r of rows) {
        out.set(r.community_id, { count: r.n ?? 0 });
      }
      return out;
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
  ): Promise<AnalyticsAllTimeTotalsRow> {
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
          -- (asOf JST day + 1) used as an exclusive upper bound on
          -- both DONATION rows and the MV-coverage range. Historic
          -- asOf must not count DONATION transactions or chain
          -- depths from dates past asOf; otherwise the summary card
          -- would mix the past-point view with whatever landed
          -- after, contradicting stageCounts.total /
          -- communityActivityRate which ARE clamped.
          SELECT
            ((${asOf}::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo')::date + 1)
            AS upper_jst_date
        ),
        donation_totals AS (
          -- Sources from mv_donation_tx_edges. The MV's burn-target
          -- / self-donation / cross-community-leakage exclusions
          -- match civicship's gift-economy DONATION definition and
          -- so are correct for the all-time totals too — same
          -- reasoning as the donation_* CTEs in findMemberStatsBulk.
          SELECT
            COALESCE(SUM(e."from_point_change"), 0)::bigint AS total_donation_points,
            MAX(e."chain_depth")::int AS max_chain_depth
          FROM "mv_donation_tx_edges" e
          CROSS JOIN asof_bound ab
          WHERE e."sender_community_id" = ${communityId}
            AND e."date" < ab.upper_jst_date
        ),
        data_range AS (
          -- MV "date" column is a JST-encoded date; compare against
          -- the same upper_jst_date as donation_totals so a historic
          -- asOf doesn't extend dataTo past the requested instant.
          SELECT
            MIN("date") AS data_from,
            MAX("date") AS data_to
          FROM "mv_transaction_summary_daily", asof_bound ab
          WHERE "community_id" = ${communityId}
            AND "date" < ab.upper_jst_date
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

  async findChainDepthDistribution(
    ctx: IContext,
    communityId: string,
    asOf: Date,
    maxBucketDepth: number,
  ): Promise<AnalyticsChainDepthBucketRow[]> {
    return ctx.issuer.public(ctx, async (tx) => {
      // generate_series produces depth 1..maxBucketDepth so the
      // returned array always has a stable shape (every bucket
      // emitted, count = 0 for empty depths) regardless of
      // community size or chain-population. The LEFT JOIN against
      // the per-tx aggregation collapses chain_depth >=
      // maxBucketDepth into the final bucket via LEAST.
      //
      // Sender-side guards mirror findWindowHubMemberCountBulk:
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
      // used by findMemberStatsBulk / findAllTimeTotals so
      // maxChainDepthAllTime (read from findAllTimeTotals) and
      // chainDepthDistribution agree on which transactions are
      // "all-time as of asOf" — without this clamp a transaction
      // landing between asOf and JST-day-end would inflate
      // maxChainDepthAllTime but be missed by the histogram, an
      // off-by-one inconsistency within a single L2 payload.
      const rows = await tx.$queryRaw<{ depth: number; count: number }[]>`
        WITH asof_bound AS (
          SELECT
            ((${asOf}::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo')::date + 1)
            AS upper_jst_date
        ),
        bucket_keys AS (
          SELECT generate_series(1, ${maxBucketDepth}::int) AS depth
        ),
        depth_counts AS (
          -- GROUP BY references the SELECT alias (depth) instead
          -- of repeating the LEAST(...) expression. Prisma assigns
          -- a new bind parameter to every Prisma substitution slot,
          -- so writing the same LEAST(...) expression twice (once
          -- in SELECT, once in GROUP BY) yields two different
          -- parameter slots ($1, $3) at the wire level. PostgreSQL
          -- then refuses to recognise the GROUP BY expression as
          -- matching the SELECT one syntactically, raising
          -- "column e.chain_depth must appear in the GROUP BY
          -- clause". Alias reference (PostgreSQL-supported since
          -- 9.x) sidesteps the parameter duplication and stays
          -- robust to future SELECT-column reorders, unlike
          -- positional GROUP BY.
          --
          -- Sources from mv_donation_tx_edges. The MV's filters
          -- (burn-target / self-donation / cross-community-leakage
          -- exclusion) are correct for the donation graph too:
          -- self-donations don't form chains, burn targets don't
          -- forward, and cross-community DONATIONs are leakage
          -- that shouldn't shape this community's chain histogram.
          SELECT
            LEAST(e."chain_depth", ${maxBucketDepth}::int) AS depth,
            COUNT(*)::int AS n
          FROM "mv_donation_tx_edges" e
          CROSS JOIN asof_bound ab
          WHERE e."sender_community_id" = ${communityId}
            AND e."chain_depth" >= 1
            AND e."date" < ab.upper_jst_date
          GROUP BY depth
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
