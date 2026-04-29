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
          SELECT (${asOf}::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo') AS ts
        ),
        asof_bound AS (
          SELECT
            ((ts::date + 1) AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC') AS upper_ts
          FROM asof_jst
        ),
        members AS (
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
          SELECT
            fw."community_id" AS community_id,
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
            AND fw."community_id" = ANY(${communityIds}::text[])
          INNER JOIN members m
            ON m."user_id" = fw."user_id"
            AND m."community_id" = fw."community_id"
          CROSS JOIN asof_bound ab
          WHERE t."reason" = 'DONATION'
            AND t."created_at" < ab.upper_ts
          GROUP BY fw."community_id", fw."user_id", jst_day, jst_month
        ),
        donation_recipients AS (
          SELECT
            fw."community_id" AS community_id,
            fw."user_id" AS user_id,
            COUNT(DISTINCT tw."user_id")::int AS unique_recipients
          FROM "t_transactions" t
          INNER JOIN "t_wallets" fw
            ON fw."id" = t."from"
            AND fw."community_id" = ANY(${communityIds}::text[])
          INNER JOIN "t_wallets" tw
            ON tw."id" = t."to"
            AND tw."user_id" IS NOT NULL
            AND tw."user_id" <> fw."user_id"
          INNER JOIN members m
            ON m."user_id" = fw."user_id"
            AND m."community_id" = fw."community_id"
          CROSS JOIN asof_bound ab
          WHERE t."reason" = 'DONATION'
            AND t."created_at" < ab.upper_ts
            AND (tw."community_id" IS NULL OR tw."community_id" = fw."community_id")
          GROUP BY fw."community_id", fw."user_id"
        ),
        donation_received AS (
          SELECT
            tw."community_id" AS community_id,
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
            AND tw."community_id" = ANY(${communityIds}::text[])
          INNER JOIN members m
            ON m."user_id" = tw."user_id"
            AND m."community_id" = tw."community_id"
          INNER JOIN "t_wallets" fw
            ON fw."id" = t."from"
            AND fw."user_id" IS NOT NULL
            AND (fw."community_id" IS NULL OR fw."community_id" = tw."community_id")
          CROSS JOIN asof_bound ab
          WHERE t."reason" = 'DONATION'
            AND t."created_at" < ab.upper_ts
          GROUP BY tw."community_id", tw."user_id", jst_day, jst_month
        ),
        donation_in_aggregates AS (
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
          SELECT
            tw."community_id" AS community_id,
            tw."user_id" AS user_id,
            COUNT(DISTINCT fw."user_id")::int AS unique_senders
          FROM "t_transactions" t
          INNER JOIN "t_wallets" tw
            ON tw."id" = t."to"
            AND tw."community_id" = ANY(${communityIds}::text[])
          INNER JOIN "t_wallets" fw
            ON fw."id" = t."from"
            AND fw."user_id" IS NOT NULL
            AND fw."user_id" <> tw."user_id"
          INNER JOIN members m
            ON m."user_id" = tw."user_id"
            AND m."community_id" = tw."community_id"
          CROSS JOIN asof_bound ab
          WHERE t."reason" = 'DONATION'
            AND t."created_at" < ab.upper_ts
            AND (fw."community_id" IS NULL OR fw."community_id" = tw."community_id")
          GROUP BY tw."community_id", tw."user_id"
        ),
        member_tenure AS (
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
          COALESCE(SUM(da.day_points_out), 0)::bigint AS total_points_out,
          ROUND(
            COALESCE(COUNT(DISTINCT da.jst_month), 0)::numeric
              / mt.months_in::numeric,
            3
          )::double precision AS user_send_rate,
          COALESCE(MAX(dr.unique_recipients), 0)::int AS unique_donation_recipients,
          COALESCE(MAX(dia.donation_in_months), 0)::int AS donation_in_months,
          COALESCE(MAX(dia.donation_in_days), 0)::int AS donation_in_days,
          COALESCE(MAX(dia.total_points_in), 0)::bigint AS total_points_in,
          COALESCE(MAX(ds.unique_senders), 0)::int AS unique_donation_senders,
          MAX(da.jst_day) AS last_donation_day,
          MIN(da.jst_day) AS first_donation_day,
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
          -- Mirrors the L1 findWindowHubMemberCountBulk query exactly
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
          -- the L1 findWindowHubMemberCountBulk query so a now-
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
          SELECT
            fw."community_id" AS community_id,
            fw."user_id" AS user_id,
            COUNT(DISTINCT tw."user_id")::int AS unique_recipients
          FROM "t_transactions" t
          INNER JOIN "t_wallets" fw
            ON fw."id" = t."from"
            AND fw."community_id" = ANY(${communityIds}::text[])
          INNER JOIN "t_memberships" m
            ON m."community_id" = fw."community_id"
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
          GROUP BY fw."community_id", fw."user_id"
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
            (
              ((${asOf}::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo')::date + 1)
              AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC'
            ) AS upper_ts
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
          -- "column t.chain_depth must appear in the GROUP BY
          -- clause". Alias reference (PostgreSQL-supported since
          -- 9.x) sidesteps the parameter duplication and stays
          -- robust to future SELECT-column reorders, unlike
          -- positional GROUP BY.
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
