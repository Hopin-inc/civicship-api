import { Prisma, TransactionReason } from "@prisma/client";
import { injectable } from "tsyringe";
import { IContext } from "@/types/server";
import {
  CohortRetentionRow,
  CommunityContextRow,
  DateRange,
  DeepestChainRow,
  PeriodAggregateRow,
  RetentionAggregateRow,
  TransactionActiveUsersDailyRow,
  TransactionCommentRow,
  TransactionSummaryDailyRow,
  UserProfileForReportRow,
  UserTransactionAggregateRow,
} from "@/application/domain/report/data/rows";
import {
  refreshMaterializedViewTransactionSummaryDaily,
  refreshMaterializedViewUserTransactionDaily,
} from "@prisma/client/sql";

const DEFAULT_COMMENT_LIMIT = 200;

export interface IReportTransactionStatsRepository {
  findDailySummaries(
    ctx: IContext,
    communityId: string,
    range: DateRange,
  ): Promise<TransactionSummaryDailyRow[]>;
  findDailyActiveUsers(
    ctx: IContext,
    communityId: string,
    range: DateRange,
  ): Promise<TransactionActiveUsersDailyRow[]>;
  findTopUsersByTotalPoints(
    ctx: IContext,
    communityId: string,
    range: DateRange,
    topN: number,
  ): Promise<UserTransactionAggregateRow[]>;
  findTrueUniqueCounterpartiesForUsers(
    ctx: IContext,
    communityId: string,
    range: DateRange,
    userIds: string[],
  ): Promise<Map<string, number>>;
  findCommentsByDateRange(
    ctx: IContext,
    communityId: string,
    range: DateRange,
    limit?: number,
  ): Promise<TransactionCommentRow[]>;
  findUserProfiles(
    ctx: IContext,
    communityId: string,
    userIds: string[],
  ): Promise<UserProfileForReportRow[]>;
  findCommunityContext(
    ctx: IContext,
    communityId: string,
    range: DateRange,
  ): Promise<CommunityContextRow | null>;
  findDeepestChain(
    ctx: IContext,
    communityId: string,
    range: DateRange,
  ): Promise<DeepestChainRow | null>;
  findPeriodAggregate(
    ctx: IContext,
    communityId: string,
    range: DateRange,
  ): Promise<PeriodAggregateRow>;
  findRetentionAggregate(
    ctx: IContext,
    communityId: string,
    range: {
      currentWeekStart: Date;
      nextWeekStart: Date;
      prevWeekStart: Date;
      twelveWeeksAgo: Date;
    },
  ): Promise<RetentionAggregateRow>;
  findCohortRetention(
    ctx: IContext,
    communityId: string,
    cohort: { cohortStart: Date; cohortEnd: Date },
    active: { activeStart: Date; activeEnd: Date },
  ): Promise<CohortRetentionRow>;
  refreshTransactionSummaryDaily(ctx: IContext, tx: Prisma.TransactionClient): Promise<void>;
  refreshUserTransactionDaily(ctx: IContext, tx: Prisma.TransactionClient): Promise<void>;
}

@injectable()
export default class ReportTransactionStatsRepository
  implements IReportTransactionStatsRepository
{
  async findDailySummaries(
    ctx: IContext,
    communityId: string,
    range: DateRange,
  ): Promise<TransactionSummaryDailyRow[]> {
    return ctx.issuer.public(ctx, (tx) =>
      tx.transactionSummaryDailyView.findMany({
        where: {
          communityId,
          date: { gte: range.from, lte: range.to },
        },
        orderBy: [{ date: "asc" }, { reason: "asc" }],
      }),
    );
  }

  /**
   * Derive (date, active_users, senders, receivers) straight from
   * mv_user_transaction_daily. Aggregating in SQL with FILTER clauses keeps
   * us from shipping a separate MV just for distinct-count queries.
   *
   * All three counters are scoped to peer-to-peer DONATION activity
   * (`donation_out_count` / `received_donation_count`) to stay consistent
   * with the `is_sender` / `is_receiver` frame in `findRetentionAggregate`
   * and `v_user_cohort.first_active_week`. ONBOARDING / GRANT / POINT_ISSUED
   * transactions would otherwise inflate `active_users` / `receivers` for
   * anyone who merely received a system-issued grant, overstating
   * peer-to-peer engagement across the daily curve and — downstream — the
   * week-over-week `growth_rate` that divides current vs previous
   * `active_users_in_window`.
   *
   * `date` is an `@db.Date` column; the explicit `::date` cast on the bound
   * parameters avoids Postgres treating the JS Date as a timestamp(tz) and
   * losing the index on a boundary compare.
   */
  async findDailyActiveUsers(
    ctx: IContext,
    communityId: string,
    range: DateRange,
  ): Promise<TransactionActiveUsersDailyRow[]> {
    return ctx.issuer.public(ctx, async (tx) => {
      const rows = await tx.$queryRaw<
        {
          date: Date;
          active_users: number;
          senders: number;
          receivers: number;
        }[]
      >`
        SELECT
          "date",
          COUNT(DISTINCT "user_id") FILTER (
            WHERE "donation_out_count" > 0 OR "received_donation_count" > 0
          )::int AS "active_users",
          COUNT(DISTINCT "user_id") FILTER (WHERE "donation_out_count" > 0)::int AS "senders",
          COUNT(DISTINCT "user_id") FILTER (WHERE "received_donation_count" > 0)::int AS "receivers"
        FROM "mv_user_transaction_daily"
        WHERE "community_id" = ${communityId}
          AND "date" BETWEEN ${range.from}::date AND ${range.to}::date
        GROUP BY "date"
        ORDER BY "date" ASC
      `;
      return rows.map((r) => ({
        date: r.date,
        communityId,
        activeUsers: r.active_users,
        senders: r.senders,
        receivers: r.receivers,
      }));
    });
  }

  /**
   * Top-N user aggregates over the reporting window, ranked by total
   * points (in + out). The ORDER BY / LIMIT live in SQL so we only ship
   * the winners to Node — no sort/slice over every community member.
   */
  async findTopUsersByTotalPoints(
    ctx: IContext,
    communityId: string,
    range: DateRange,
    topN: number,
  ): Promise<UserTransactionAggregateRow[]> {
    return ctx.issuer.public(ctx, async (tx) => {
      const rows = await tx.$queryRaw<
        {
          user_id: string;
          tx_count_in: number;
          tx_count_out: number;
          points_in: bigint;
          points_out: bigint;
          donation_out_count: number;
          donation_out_points: bigint;
          received_donation_count: number;
          chain_root_count: number;
          max_chain_depth_started: number | null;
          chain_depth_reached_max: number | null;
          unique_counterparties_sum: number;
        }[]
      >`
        SELECT
          "user_id",
          COALESCE(SUM("tx_count_in"), 0)::int AS "tx_count_in",
          COALESCE(SUM("tx_count_out"), 0)::int AS "tx_count_out",
          COALESCE(SUM("points_in"), 0)::bigint AS "points_in",
          COALESCE(SUM("points_out"), 0)::bigint AS "points_out",
          COALESCE(SUM("donation_out_count"), 0)::int AS "donation_out_count",
          COALESCE(SUM("donation_out_points"), 0)::bigint AS "donation_out_points",
          COALESCE(SUM("received_donation_count"), 0)::int AS "received_donation_count",
          COALESCE(SUM("chain_root_count"), 0)::int AS "chain_root_count",
          MAX("max_chain_depth_started")::int AS "max_chain_depth_started",
          MAX("chain_depth_reached_max")::int AS "chain_depth_reached_max",
          COALESCE(SUM("unique_counterparties"), 0)::int AS "unique_counterparties_sum"
        FROM "mv_user_transaction_daily"
        WHERE "community_id" = ${communityId}
          AND "date" BETWEEN ${range.from}::date AND ${range.to}::date
        GROUP BY "user_id"
        ORDER BY (COALESCE(SUM("points_in"), 0) + COALESCE(SUM("points_out"), 0)) DESC
        LIMIT ${topN}
      `;
      return rows.map((r) => ({
        userId: r.user_id,
        txCountIn: r.tx_count_in,
        txCountOut: r.tx_count_out,
        pointsIn: r.points_in,
        pointsOut: r.points_out,
        donationOutCount: r.donation_out_count,
        donationOutPoints: r.donation_out_points,
        receivedDonationCount: r.received_donation_count,
        chainRootCount: r.chain_root_count,
        maxChainDepthStarted: r.max_chain_depth_started,
        chainDepthReachedMax: r.chain_depth_reached_max,
        uniqueCounterpartiesSum: r.unique_counterparties_sum,
      }));
    });
  }

  /**
   * Distinct counterparty count across the whole reporting window for the
   * supplied users. Unlike `unique_counterparties_sum` (which lives in
   * mv_user_transaction_daily and is a sum of *per-day* distincts), this is
   * a genuine set cardinality over the period — "how many different people
   * did this user give to across the whole week", not "sum of new-per-day
   * counterparties".
   *
   * Scoped with `userIds` so the scan fans out only to the top-N ids already
   * selected by the upstream query. `t_wallets.user_id` has an index
   * (`t_wallets_user_id_idx`) so the lookup joining the sender-side is cheap
   * even without a dedicated MV.
   *
   * Excludes transactions where the counterparty wallet has no `user_id`
   * (e.g. community wallets) so the count is strictly "people this user sent
   * points to", and excludes self-transfers (`tw.user_id = fw.user_id`) from
   * the DISTINCT via a FILTER clause — the metric is "how many different
   * *other* people did this user give to", which is what the breadth-of-
   * activity signal downstream in the prompt is trying to describe.
   *
   * Uses a half-open `[from 00:00 JST, (to + 1) 00:00 JST)` window to match
   * the MV bucketing elsewhere in this file. `t_transactions.created_at` is
   * Prisma `DateTime` → `timestamp WITHOUT time zone` holding naive UTC,
   * so we convert the JST date boundaries to naive UTC on the constant side
   * (`::date AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC'`): first cast the
   * date to a timestamptz at JST midnight, then render that instant as a
   * naive UTC wall-clock — the same value the column holds. Keeping the
   * transform off the column preserves index usage (SARGable) while still
   * being independent of the DB session timezone, unlike the prior
   * `timestamp >= timestamptz` form which implicitly cast via the
   * session's timezone.
   */
  async findTrueUniqueCounterpartiesForUsers(
    ctx: IContext,
    communityId: string,
    range: DateRange,
    userIds: string[],
  ): Promise<Map<string, number>> {
    if (userIds.length === 0) return new Map();
    return ctx.issuer.public(ctx, async (tx) => {
      const rows = await tx.$queryRaw<
        { user_id: string; true_unique_counterparties: number }[]
      >`
        SELECT
          fw."user_id" AS "user_id",
          COUNT(DISTINCT tw."user_id") FILTER (
            WHERE tw."user_id" <> fw."user_id"
          )::int AS "true_unique_counterparties"
        FROM "t_transactions" t
        INNER JOIN "t_wallets" fw
          ON fw."id" = t."from"
          AND fw."user_id" = ANY(${userIds}::text[])
          AND fw."community_id" = ${communityId}
        INNER JOIN "t_wallets" tw
          ON tw."id" = t."to"
          AND tw."user_id" IS NOT NULL
        WHERE t."created_at" >= (${range.from}::date AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
          AND t."created_at" <  ((${range.to}::date + 1) AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
          AND (tw."community_id" IS NULL OR tw."community_id" = fw."community_id")
        GROUP BY fw."user_id"
      `;
      return new Map(rows.map((r) => [r.user_id, r.true_unique_counterparties]));
    });
  }

  async findCommentsByDateRange(
    ctx: IContext,
    communityId: string,
    range: DateRange,
    limit: number = DEFAULT_COMMENT_LIMIT,
  ): Promise<TransactionCommentRow[]> {
    return ctx.issuer.public(ctx, (tx) =>
      tx.transactionCommentView.findMany({
        where: {
          communityId,
          date: { gte: range.from, lte: range.to },
        },
        orderBy: [{ createdAt: "desc" }],
        take: limit,
      }),
    );
  }

  async findUserProfiles(
    ctx: IContext,
    communityId: string,
    userIds: string[],
  ): Promise<UserProfileForReportRow[]> {
    if (userIds.length === 0) return [];
    return ctx.issuer.public(ctx, (tx) =>
      tx.userProfileForReportView.findMany({
        where: {
          communityId,
          userId: { in: userIds },
        },
      }),
    );
  }

  /**
   * Pull community identity + reporting-window activity stats in a single
   * round trip. Member count lives in `t_memberships` (RLS-protected but
   * read-safe for community members and admins via `issuer.public`), and
   * the distinct active-user count is scanned directly off
   * `mv_user_transaction_daily` for the same JST window used by the report
   * helpers elsewhere in this file.
   *
   * `active_users_in_window` is scoped to peer-to-peer DONATION activity
   * (`donation_out_count > 0 OR received_donation_count > 0`) to stay
   * consistent with the retention frame — a user is "active" only if they
   * actually participated in a peer donation, not if they merely received
   * an admin-issued ONBOARDING / GRANT / POINT_ISSUED transaction. The
   * derived `active_rate` (computed in the presenter as
   * `active_users_in_window / total_members`) therefore reports
   * peer-to-peer engagement rather than system-noise-inflated reach.
   *
   * Returns null when the community is not found; the presenter treats this
   * as an optional block so the payload still serialises for a soft-deleted
   * or mis-passed community id.
   */
  async findCommunityContext(
    ctx: IContext,
    communityId: string,
    range: DateRange,
  ): Promise<CommunityContextRow | null> {
    return ctx.issuer.public(ctx, async (tx) => {
      const rows = await tx.$queryRaw<
        {
          id: string;
          name: string;
          point_name: string;
          bio: string | null;
          established_at: Date | null;
          website: string | null;
          total_members: number;
          active_users_in_window: number;
        }[]
      >`
        WITH member_count AS (
          SELECT COUNT(*)::int AS n
          FROM "t_memberships"
          WHERE "community_id" = ${communityId}
            AND "status" = 'JOINED'
        ),
        active_in_window AS (
          SELECT COUNT(DISTINCT "user_id")::int AS n
          FROM "mv_user_transaction_daily"
          WHERE "community_id" = ${communityId}
            AND "date" BETWEEN ${range.from}::date AND ${range.to}::date
            AND ("donation_out_count" > 0 OR "received_donation_count" > 0)
        )
        SELECT
          c."id",
          c."name",
          c."point_name",
          c."bio",
          c."established_at",
          c."website",
          (SELECT n FROM member_count) AS "total_members",
          (SELECT n FROM active_in_window) AS "active_users_in_window"
        FROM "t_communities" c
        WHERE c."id" = ${communityId}
        LIMIT 1
      `;
      if (rows.length === 0) return null;
      const r = rows[0];
      return {
        communityId: r.id,
        name: r.name,
        pointName: r.point_name,
        bio: r.bio,
        establishedAt: r.established_at,
        website: r.website,
        totalMembers: r.total_members,
        activeUsersInWindow: r.active_users_in_window,
      };
    });
  }

  /**
   * The single transaction with the largest `chain_depth` within the JST
   * reporting window. Mirrors the community-scoping predicate used by
   * `mv_transaction_summary_daily` / `v_transaction_comments`:
   * `COALESCE(fw.community_id, tw.community_id) = $1` plus the
   * defensive-consistency check that rejects cross-community pairs.
   *
   * ORDER BY depth DESC, created_at ASC so that ties resolve to the
   * *earliest* deep chain in the window — intuitively "the one that started
   * the cascade" rather than whichever the planner picked first. Returns
   * null when no chained transaction exists for the window.
   */
  async findDeepestChain(
    ctx: IContext,
    communityId: string,
    range: DateRange,
  ): Promise<DeepestChainRow | null> {
    return ctx.issuer.public(ctx, async (tx) => {
      const rows = await tx.$queryRaw<
        {
          id: string;
          chain_depth: number;
          reason: TransactionReason;
          comment: string | null;
          date: Date;
          from_user_id: string | null;
          to_user_id: string | null;
          created_by_user_id: string | null;
          parent_tx_id: string | null;
        }[]
      >`
        SELECT
          t."id",
          t."chain_depth"::int AS "chain_depth",
          t."reason",
          t."comment",
          -- Double AT TIME ZONE to convert the naive-UTC timestamp
          -- column to a JST calendar day. A single AT TIME ZONE
          -- 'Asia/Tokyo' would treat the value AS JST and shift it by
          -- -9h, mis-bucketing transactions between 00:00-08:59 JST --
          -- the same bug the 20260416000001_fix_report_views_jst_bucketing
          -- migration fixed in the MV side.
          ((t."created_at" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo')::date) AS "date",
          fw."user_id" AS "from_user_id",
          tw."user_id" AS "to_user_id",
          t."created_by" AS "created_by_user_id",
          t."parent_tx_id"
        FROM "t_transactions" t
        LEFT JOIN "t_wallets" fw ON fw."id" = t."from"
        LEFT JOIN "t_wallets" tw ON tw."id" = t."to"
        WHERE COALESCE(fw."community_id", tw."community_id") = ${communityId}
          AND (fw."community_id" IS NULL
               OR tw."community_id" IS NULL
               OR fw."community_id" = tw."community_id")
          AND t."chain_depth" IS NOT NULL
          -- Half-open window [from JST 00:00, (to + 1 day) JST 00:00)
          -- covers exactly the JST calendar days from..to inclusive,
          -- matching the bucketing used by the report MVs. created_at
          -- is timestamp WITHOUT time zone (Prisma DateTime default)
          -- holding naive UTC, so we convert the JST date boundaries to
          -- naive UTC on the constant side (::date AT TIME ZONE
          -- 'Asia/Tokyo' AT TIME ZONE 'UTC') to match the column's
          -- storage format -- independent of DB session timezone, and
          -- the column stays untouched so the B-tree index on
          -- "created_at" can still be used.
          AND t."created_at" >= (${range.from}::date AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
          AND t."created_at" <  ((${range.to}::date + 1) AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
        ORDER BY t."chain_depth" DESC, t."created_at" ASC
        LIMIT 1
      `;
      if (rows.length === 0) return null;
      const r = rows[0];
      return {
        transactionId: r.id,
        chainDepth: r.chain_depth,
        reason: r.reason,
        comment: r.comment,
        date: r.date,
        fromUserId: r.from_user_id,
        toUserId: r.to_user_id,
        createdByUserId: r.created_by_user_id,
        parentTxId: r.parent_tx_id,
      };
    });
  }

  /**
   * Headline aggregates (active users / tx count / points volume / new
   * memberships) for an arbitrary JST window. Backs the
   * `previous_period` payload block. One round trip per call — three
   * independent scans combined via CROSS JOIN of single-row CTEs so the
   * planner sees them as a single statement.
   *
   * `active_users_in_window` is scoped to peer-to-peer DONATION activity
   * (`donation_out_count > 0 OR received_donation_count > 0`), matching
   * `findCommunityContext` / `findDailyActiveUsers` so the
   * `growth_rate.active_users` in the presenter (current vs previous
   * window) compares apples-to-apples. A broad `COUNT DISTINCT user_id`
   * here would inflate the previous-window numerator for communities with
   * heavy admin-issued ONBOARDING / GRANT activity and make
   * week-over-week peer-engagement changes look smaller than they are.
   *
   * `new_members` is sourced from `t_memberships.created_at` (JOINED) to
   * stay consistent with `RetentionSummary.new_members`, rather than from
   * `ONBOARDING` transactions which have operational noise around
   * re-issuance.
   */
  async findPeriodAggregate(
    ctx: IContext,
    communityId: string,
    range: DateRange,
  ): Promise<PeriodAggregateRow> {
    return ctx.issuer.public(ctx, async (tx) => {
      const rows = await tx.$queryRaw<
        {
          active_users_in_window: number;
          total_tx_count: number;
          total_points_sum: bigint;
          new_members: number;
        }[]
      >`
        WITH active_users AS (
          SELECT COUNT(DISTINCT "user_id")::int AS n
          FROM "mv_user_transaction_daily"
          WHERE "community_id" = ${communityId}
            AND "date" BETWEEN ${range.from}::date AND ${range.to}::date
            AND ("donation_out_count" > 0 OR "received_donation_count" > 0)
        ),
        tx_totals AS (
          SELECT
            COALESCE(SUM("tx_count"), 0)::int AS tx_count,
            COALESCE(SUM("points_sum"), 0)::bigint AS points_sum
          FROM "mv_transaction_summary_daily"
          WHERE "community_id" = ${communityId}
            AND "date" BETWEEN ${range.from}::date AND ${range.to}::date
        ),
        new_members AS (
          SELECT COUNT(*)::int AS n
          FROM "t_memberships"
          WHERE "community_id" = ${communityId}
            AND "status" = 'JOINED'
            -- created_at is timestamp WITHOUT time zone (Prisma
            -- default) holding naive UTC, so convert the JST date
            -- boundaries to naive UTC on the constant side. See the
            -- commentary on findDeepestChain for the full rationale;
            -- keeping the column untouched preserves the B-tree index
            -- and the comparison is session-TZ-independent.
            AND "created_at" >= (${range.from}::date AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
            AND "created_at" <  ((${range.to}::date + 1) AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
        )
        SELECT
          au.n                 AS "active_users_in_window",
          tt.tx_count          AS "total_tx_count",
          tt.points_sum        AS "total_points_sum",
          nm.n                 AS "new_members"
        FROM active_users au, tx_totals tt, new_members nm
      `;
      const r = rows[0];
      return {
        activeUsersInWindow: r.active_users_in_window,
        totalTxCount: r.total_tx_count,
        totalPointsSum: r.total_points_sum,
        newMembers: r.new_members,
      };
    });
  }

  /**
   * Retention signals for one week. Computed via FULL OUTER JOIN on the
   * week-aggregated sender sets for [currentWeekStart, nextWeekStart) and
   * [prevWeekStart, currentWeekStart) so each user contributes one row
   * regardless of which weeks they appear in — a naive two-pass COUNT
   * would double-count people active in both weeks.
   *
   * `is_sender` is gated on `donation_out_count > 0` (not
   * `tx_count_out > 0`) so the definition stays consistent with
   * `returned_senders` which scans the same MV column. This matters:
   * ONBOARDING / GRANT transactions increment `tx_count_out` for the
   * admin wallet but not `donation_out_count`, and we want retention to
   * track peer-to-peer DONATION behaviour specifically.
   *
   * `is_receiver` is gated symmetrically on `received_donation_count > 0`
   * (DONATION-only) rather than `tx_count_in > 0`. The same ONBOARDING /
   * GRANT noise that we filter out of the sender frame also shows up on
   * the receiver side (admin-issued grants land as incoming transactions
   * on every recipient's wallet); including those in `is_receiver` would
   * inflate `current_active_count` and the `active_rate_any` the
   * presenter divides out of it, overstating peer-to-peer engagement.
   *
   * The `ever_before` CTE is bounded to a 12-week lookback to keep the
   * returning-users scan from fanning out to years of history on mature
   * communities; the trade-off is documented in the design notes —
   * 13+-week comebacks land in no bucket.
   */
  async findRetentionAggregate(
    ctx: IContext,
    communityId: string,
    range: {
      currentWeekStart: Date;
      nextWeekStart: Date;
      prevWeekStart: Date;
      twelveWeeksAgo: Date;
    },
  ): Promise<RetentionAggregateRow> {
    return ctx.issuer.public(ctx, async (tx) => {
      const rows = await tx.$queryRaw<
        {
          new_members: number;
          retained_senders: number;
          returned_senders: number;
          churned_senders: number;
          current_senders_count: number;
          current_active_count: number;
        }[]
      >`
        WITH current_week AS (
          SELECT
            "user_id",
            BOOL_OR("donation_out_count" > 0) AS is_sender,
            BOOL_OR("received_donation_count" > 0) AS is_receiver
          FROM "mv_user_transaction_daily"
          WHERE "community_id" = ${communityId}
            AND "date" >= ${range.currentWeekStart}::date
            AND "date" <  ${range.nextWeekStart}::date
          GROUP BY "user_id"
        ),
        prev_week AS (
          SELECT
            "user_id",
            BOOL_OR("donation_out_count" > 0) AS is_sender
          FROM "mv_user_transaction_daily"
          WHERE "community_id" = ${communityId}
            AND "date" >= ${range.prevWeekStart}::date
            AND "date" <  ${range.currentWeekStart}::date
          GROUP BY "user_id"
        ),
        ever_before AS (
          SELECT DISTINCT "user_id"
          FROM "mv_user_transaction_daily"
          WHERE "community_id" = ${communityId}
            AND "date" >= ${range.twelveWeeksAgo}::date
            AND "date" <  ${range.prevWeekStart}::date
            AND "donation_out_count" > 0
        ),
        new_this_week AS (
          SELECT "user_id"
          FROM "t_memberships"
          WHERE "community_id" = ${communityId}
            AND "status" = 'JOINED'
            -- created_at is naive-UTC timestamp -- see the boundary
            -- conversion rationale in findDeepestChain. The
            -- ::date AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC'
            -- dance pins the window to JST midnight regardless of the
            -- DB session timezone.
            AND "created_at" >= (${range.currentWeekStart}::date AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
            AND "created_at" <  (${range.nextWeekStart}::date AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
        ),
        joined AS (
          SELECT
            cw."user_id" AS cw_user,
            pw."user_id" AS pw_user,
            cw.is_sender AS cw_is_sender,
            cw.is_receiver AS cw_is_receiver,
            pw.is_sender AS pw_is_sender,
            eb."user_id" AS eb_user
          FROM current_week cw
          FULL OUTER JOIN prev_week pw
            ON cw."user_id" = pw."user_id"
          LEFT JOIN ever_before eb
            ON COALESCE(cw."user_id", pw."user_id") = eb."user_id"
        )
        SELECT
          (SELECT COUNT(*)::int FROM new_this_week) AS "new_members",
          COUNT(*) FILTER (
            WHERE cw_is_sender = true AND pw_is_sender = true
          )::int AS "retained_senders",
          COUNT(*) FILTER (
            WHERE cw_is_sender = true
              AND (pw_is_sender IS NULL OR pw_is_sender = false)
              AND eb_user IS NOT NULL
          )::int AS "returned_senders",
          COUNT(*) FILTER (
            WHERE pw_is_sender = true
              AND (cw_is_sender IS NULL OR cw_is_sender = false)
          )::int AS "churned_senders",
          COUNT(*) FILTER (WHERE cw_is_sender = true)::int AS "current_senders_count",
          COUNT(*) FILTER (
            WHERE cw_is_sender = true OR cw_is_receiver = true
          )::int AS "current_active_count"
        FROM joined
      `;
      const r = rows[0];
      return {
        newMembers: r.new_members,
        retainedSenders: r.retained_senders,
        returnedSenders: r.returned_senders,
        churnedSenders: r.churned_senders,
        currentSendersCount: r.current_senders_count,
        currentActiveCount: r.current_active_count,
      };
    });
  }

  /**
   * Week-N retention lookup: how many members of the cohort that joined
   * during `[cohortStart, cohortEnd)` were senders during
   * `[activeStart, activeEnd)`. Returns raw numerator / denominator so
   * an empty cohort surfaces as `cohortSize = 0` and the presenter
   * converts that to `null` rather than `0 / 0`.
   *
   * `is_sender` uses the same `donation_out_count > 0` frame as
   * `findRetentionAggregate` so week1/week4 retention and the weekly
   * retention counters are apples-to-apples.
   */
  async findCohortRetention(
    ctx: IContext,
    communityId: string,
    cohort: { cohortStart: Date; cohortEnd: Date },
    active: { activeStart: Date; activeEnd: Date },
  ): Promise<CohortRetentionRow> {
    return ctx.issuer.public(ctx, async (tx) => {
      const rows = await tx.$queryRaw<
        { cohort_size: number; active_next_week: number }[]
      >`
        WITH cohort AS (
          SELECT "user_id"
          FROM "t_memberships"
          WHERE "community_id" = ${communityId}
            AND "status" = 'JOINED'
            -- Naive-UTC timestamp column vs JST-midnight boundary:
            -- see the findDeepestChain comment for the full
            -- explanation of the double AT TIME ZONE dance.
            AND "created_at" >= (${cohort.cohortStart}::date AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
            AND "created_at" <  (${cohort.cohortEnd}::date AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
        ),
        active_members AS (
          SELECT DISTINCT "user_id"
          FROM "mv_user_transaction_daily"
          WHERE "community_id" = ${communityId}
            AND "date" >= ${active.activeStart}::date
            AND "date" <  ${active.activeEnd}::date
            AND "donation_out_count" > 0
        )
        SELECT
          COUNT(DISTINCT c."user_id")::int AS "cohort_size",
          COUNT(DISTINCT a."user_id")::int AS "active_next_week"
        FROM cohort c
        LEFT JOIN active_members a USING ("user_id")
      `;
      const r = rows[0];
      return { cohortSize: r.cohort_size, activeNextWeek: r.active_next_week };
    });
  }

  async refreshTransactionSummaryDaily(ctx: IContext, tx: Prisma.TransactionClient): Promise<void> {
    await tx.$queryRawTyped(refreshMaterializedViewTransactionSummaryDaily());
  }

  async refreshUserTransactionDaily(ctx: IContext, tx: Prisma.TransactionClient): Promise<void> {
    await tx.$queryRawTyped(refreshMaterializedViewUserTransactionDaily());
  }
}
