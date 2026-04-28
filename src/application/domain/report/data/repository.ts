import {
  Prisma,
  ReportStatus,
  ReportTemplateKind,
  ReportTemplateScope,
  TransactionReason,
} from "@prisma/client";
import { injectable } from "tsyringe";
import { IContext } from "@/types/server";
import {
  CohortRetentionRow,
  CommunityContextRow,
  DateRange,
  DeepestChainRow,
  IReportRepository,
  PeriodAggregateRow,
  RetentionAggregateRow,
  TransactionActiveUsersDailyRow,
  TransactionCommentRow,
  TransactionSummaryDailyRow,
  UserProfileForReportRow,
  UserTransactionAggregateRow,
} from "@/application/domain/report/data/interface";
import {
  CommunitySummaryCursor,
  PrismaReport,
  PrismaReportGoldenCase,
  PrismaReportTemplate,
  reportGoldenCaseSelect,
  reportSelect,
  reportTemplateSelect,
} from "@/application/domain/report/data/type";
import {
  refreshMaterializedViewTransactionSummaryDaily,
  refreshMaterializedViewUserTransactionDaily,
} from "@prisma/client/sql";

const DEFAULT_COMMENT_LIMIT = 200;

@injectable()
export default class ReportRepository implements IReportRepository {
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

  // =========================================================================
  // Report AI entities (ReportTemplate / Report)
  // =========================================================================

  async findTemplate(
    ctx: IContext,
    variant: string,
    communityId: string | null,
  ): Promise<PrismaReportTemplate | null> {
    return ctx.issuer.public(ctx, (tx) =>
      tx.reportTemplate.findFirst({
        where: {
          variant,
          kind: ReportTemplateKind.GENERATION,
          isEnabled: true,
          // Filter on `isActive` too: without it, once multiple versions
          // of the same (variant, kind, scope) coexist — e.g. v1
          // `isActive=true` alongside a v2 shakeout candidate with
          // `isActive=false` — `findFirst` matches both and Postgres
          // picks non-deterministically (see PR-F5 regression report).
          // The production `templateSelector` already filters on
          // `isActive=true`; this method is used by the admin
          // `viewReportTemplate` query and the CI non-pinned path,
          // both of which expect "the live template" semantics.
          isActive: true,
          OR: [...(communityId ? [{ communityId }] : []), { communityId: null }],
        },
        // Primary: prefer the COMMUNITY-scope override when one exists
        // (communityId NULLS LAST under ASC in Postgres, so a non-null
        // community row sorts before the SYSTEM fallback).
        // Secondary: when multiple active versions of the same scope
        // exist (e.g. a planned overlap during a weighted A/B rollout
        // that routes prod through `templateSelector`), pin the
        // single-template admin view to the newest active version
        // rather than a non-deterministic pick.
        orderBy: [{ communityId: "asc" }, { version: "desc" }],
        select: reportTemplateSelect,
      }),
    );
  }

  /**
   * CI-only direct lookup. See `IReportRepository.findTemplateByVersion`
   * for the contract — ignores `isEnabled` / `isActive` so the Golden
   * Case harness can grade an inactive candidate during the v2
   * shakeout window (PR-F5 §7). Not for production use.
   */
  async findTemplateByVersion(
    ctx: IContext,
    variant: string,
    kind: ReportTemplateKind,
    version: number,
    communityId: string | null,
  ): Promise<PrismaReportTemplate | null> {
    return ctx.issuer.public(ctx, (tx) =>
      tx.reportTemplate.findFirst({
        where: { variant, kind, version, communityId },
        select: reportTemplateSelect,
      }),
    );
  }

  /**
   * Active candidates for (variant, kind, communityId). Unlike `findTemplate`
   * this does NOT fall back to SYSTEM when `communityId` is non-null — the
   * caller (the selector) must issue a separate SYSTEM query when the
   * community-scoped query returns empty, because it needs to distinguish
   * "community has its own A/B set" from "community uses SYSTEM". Only
   * `isEnabled=true AND isActive=true` rows are returned so deprecated /
   * rolled-back candidates never enter the weighted draw.
   */
  async findActiveTemplates(
    ctx: IContext,
    variant: string,
    kind: ReportTemplateKind,
    communityId: string | null,
  ): Promise<PrismaReportTemplate[]> {
    return ctx.issuer.public(ctx, (tx) =>
      tx.reportTemplate.findMany({
        where: {
          variant,
          kind,
          communityId,
          isEnabled: true,
          isActive: true,
        },
        orderBy: { id: "asc" },
        select: reportTemplateSelect,
      }),
    );
  }

  /**
   * Admin-list backing for `reportTemplates`. Distinct from
   * `findActiveTemplates` (selector hot path, isActive+isEnabled fixed
   * to true and scoped strictly to `communityId`):
   *
   *   - `communityId === null` returns SYSTEM-only.
   *   - `communityId === X` returns SYSTEM ∪ COMMUNITY(X) so the admin
   *     screen can show "what actually runs for this community" — both
   *     the override row and the SYSTEM fallback the override would
   *     replace — in a single sweep.
   *   - `includeInactive=false` (default) keeps the live filter
   *     `isActive=true AND isEnabled=true` so the screen does not surface
   *     rolled-back / disabled rows by default.
   *   - `includeInactive=true` returns every row regardless of state so
   *     the admin can audit history.
   *
   * Sort is `version DESC, createdAt DESC` so the newest revision lands
   * at the top and same-version rows order by recency. The selector
   * does NOT call this — production runs go through
   * `findActiveTemplates`.
   */
  async findTemplates(
    ctx: IContext,
    variant: string,
    communityId: string | null,
    kind: ReportTemplateKind,
    includeInactive: boolean,
  ): Promise<PrismaReportTemplate[]> {
    // Admin-only path (the GraphQL query carries `IsAdmin`); use the
    // internal issuer for consistency with the other Phase 2 admin
    // reads (`findAllReports`, `findCommunityReportSummary`,
    // `getTemplateBreakdown`). The legacy single-row `findTemplate` /
    // selector hot path `findActiveTemplates` continue to use `public`
    // because they're invoked from non-admin call sites
    // (`reportTemplate(communityId, variant)` is admin-gated but the
    // selector path runs during generate from any community member).
    return ctx.issuer.internal((tx) =>
      tx.reportTemplate.findMany({
        where: {
          variant,
          kind,
          ...(communityId === null
            ? { communityId: null }
            : { OR: [{ communityId }, { communityId: null }] }),
          ...(includeInactive ? {} : { isActive: true, isEnabled: true }),
        },
        orderBy: [{ version: "desc" }, { createdAt: "desc" }],
        select: reportTemplateSelect,
      }),
    );
  }

  /**
   * Resolve the active SYSTEM-scope JUDGE template for a variant.
   * Filters on `isEnabled` AND `isActive` so the F1 versioning bookkeeping
   * also gates judge selection — a JUDGE row marked inactive (e.g. a
   * candidate prompt that is being rolled back) is skipped.
   * `communityId IS NULL` is hardcoded because the application-layer
   * guard rejects COMMUNITY-scope JUDGE templates upstream; encoding the
   * same constraint here means a stray COMMUNITY judge row that
   * somehow gets seeded in the future will not silently take effect.
   */
  async findJudgeTemplate(
    ctx: IContext,
    variant: string,
  ): Promise<PrismaReportTemplate | null> {
    return ctx.issuer.public(ctx, (tx) =>
      tx.reportTemplate.findFirst({
        where: {
          variant,
          kind: ReportTemplateKind.JUDGE,
          communityId: null,
          isEnabled: true,
          isActive: true,
        },
        orderBy: { version: "desc" },
        select: reportTemplateSelect,
      }),
    );
  }

  async updateReportJudgeResult(
    ctx: IContext,
    id: string,
    data: {
      judgeScore: number | null;
      judgeBreakdown: Prisma.InputJsonValue | null;
      judgeTemplateId: string | null;
      coverageJson: Prisma.InputJsonValue | null;
    },
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaReport> {
    const doUpdate = (client: Prisma.TransactionClient) =>
      client.report.update({
        where: { id },
        data: {
          judgeScore: data.judgeScore,
          // Use Prisma.DbNull (SQL NULL) rather than Prisma.JsonNull
          // (the JSON literal `null`). The schema comment on
          // judge_breakdown / coverage_json reads "left null", which
          // is SQL NULL — JsonNull would store a four-byte JSON `null`
          // value that survives `IS NULL` checks differently than
          // missing data and would force every consumer to handle two
          // distinct flavours of "no result" for the same column.
          judgeBreakdown: data.judgeBreakdown ?? Prisma.DbNull,
          judgeTemplateId: data.judgeTemplateId,
          coverageJson: data.coverageJson ?? Prisma.DbNull,
        },
        select: reportSelect,
      });

    if (tx) return doUpdate(tx);
    return ctx.issuer.internal(doUpdate);
  }

  async findGoldenCases(
    ctx: IContext,
    options: { variant?: string; pinnedVersion?: number | null } = {},
  ): Promise<PrismaReportGoldenCase[]> {
    const { variant, pinnedVersion } = options;
    // Version filter semantics (see ReportGoldenCase.templateVersion comment):
    //   pinnedVersion=N → shared baseline ∪ v{N}-specific cases.
    //   pinnedVersion null/undefined → shared baseline only (matches the
    //   production path where `pnpm ci:report-golden` grades only the
    //   currently active prompt).
    const versionWhere: Prisma.ReportGoldenCaseWhereInput =
      pinnedVersion != null
        ? { OR: [{ templateVersion: null }, { templateVersion: pinnedVersion }] }
        : { templateVersion: null };
    const where: Prisma.ReportGoldenCaseWhereInput = variant
      ? { AND: [{ variant }, versionWhere] }
      : versionWhere;
    return ctx.issuer.public(ctx, (tx) =>
      tx.reportGoldenCase.findMany({
        where,
        select: reportGoldenCaseSelect,
        orderBy: [{ variant: "asc" }, { label: "asc" }],
      }),
    );
  }

  async upsertGoldenCase(
    ctx: IContext,
    data: {
      variant: string;
      label: string;
      payloadFixture: Prisma.InputJsonValue;
      judgeCriteria: Prisma.InputJsonValue;
      minJudgeScore: number;
      forbiddenKeys: string[];
      notes?: string | null;
      expectedStatus?: ReportStatus | null;
      templateVersion?: number | null;
    },
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaReportGoldenCase> {
    const doUpsert = (client: Prisma.TransactionClient) =>
      client.reportGoldenCase.upsert({
        where: { variant_label: { variant: data.variant, label: data.label } },
        create: {
          variant: data.variant,
          label: data.label,
          payloadFixture: data.payloadFixture,
          judgeCriteria: data.judgeCriteria,
          minJudgeScore: data.minJudgeScore,
          forbiddenKeys: data.forbiddenKeys,
          notes: data.notes ?? null,
          expectedStatus: data.expectedStatus ?? null,
          templateVersion: data.templateVersion ?? null,
        },
        update: {
          payloadFixture: data.payloadFixture,
          judgeCriteria: data.judgeCriteria,
          minJudgeScore: data.minJudgeScore,
          forbiddenKeys: data.forbiddenKeys,
          notes: data.notes ?? null,
          expectedStatus: data.expectedStatus ?? null,
          templateVersion: data.templateVersion ?? null,
        },
        select: reportGoldenCaseSelect,
      });

    if (tx) return doUpsert(tx);
    return ctx.issuer.internal(doUpsert);
  }

  async upsertTemplate(
    ctx: IContext,
    variant: string,
    communityId: string | null,
    data: Omit<Prisma.ReportTemplateCreateInput, "variant" | "scope" | "community">,
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaReportTemplate> {
    const scope = communityId ? ReportTemplateScope.COMMUNITY : ReportTemplateScope.SYSTEM;
    // The admin GraphQL mutation that calls this only edits GENERATION
    // templates (the GqlUpdateReportTemplateInput has no `kind` field).
    // Pin the lookup + create to GENERATION so the JUDGE rows added in
    // PR-F7 cannot be accidentally overwritten when a (variant,
    // communityId) pair has both a GENERATION and a JUDGE row at v1.
    // When an admin path for editing JUDGE templates is added, this
    // method should grow a `kind` parameter and thread it through.
    const kind = ReportTemplateKind.GENERATION;
    // Resolve "the row to update" deterministically across both the
    // multi-version case and the all-inactive edge case:
    //   - Primary sort `isActive desc`: when a v1 active + v2 shakeout
    //     candidate (isActive=false) coexist, the active row wins so
    //     admin edits land on the live template rather than the
    //     shakeout candidate (the original bug motivating this lookup).
    //   - Secondary sort `version desc`: ties within the same isActive
    //     bucket resolve to the newest version — covers both a planned
    //     multi-active A/B overlap (picks the newer active) and the
    //     all-inactive fallback (picks the newest inactive) so an
    //     admin who deactivated every template can still edit the
    //     last-known row without hitting an unrecoverable P2002 on
    //     the version-1 unique constraint.
    const existingWhere = {
      variant,
      communityId,
      kind,
    } as const;
    const existingOrderBy = [
      { isActive: "desc" as const },
      { version: "desc" as const },
    ];
    const doUpsert = async (client: Prisma.TransactionClient) => {
      const existing = await client.reportTemplate.findFirst({
        where: existingWhere,
        orderBy: existingOrderBy,
        select: { id: true },
      });
      if (existing) {
        return client.reportTemplate.update({
          where: { id: existing.id },
          data,
          select: reportTemplateSelect,
        });
      }
      try {
        return await client.reportTemplate.create({
          data: {
            ...data,
            variant,
            scope,
            kind,
            ...(communityId ? { community: { connect: { id: communityId } } } : {}),
          },
          select: reportTemplateSelect,
        });
      } catch (e: unknown) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
          const raced = await client.reportTemplate.findFirst({
            where: existingWhere,
            orderBy: existingOrderBy,
            select: { id: true },
          });
          if (raced) {
            return client.reportTemplate.update({
              where: { id: raced.id },
              data,
              select: reportTemplateSelect,
            });
          }
        }
        throw e;
      }
    };

    if (tx) return doUpsert(tx);
    return ctx.issuer.internal(doUpsert);
  }

  async createReport(
    ctx: IContext,
    data: Prisma.ReportUncheckedCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaReport> {
    const doCreate = (client: Prisma.TransactionClient) =>
      client.report.create({ data, select: reportSelect });

    if (tx) return doCreate(tx);
    return ctx.issuer.internal(doCreate);
  }

  async findReportById(
    ctx: IContext,
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaReport | null> {
    const doFind = (client: Prisma.TransactionClient) =>
      client.report.findUnique({ where: { id }, select: reportSelect });

    if (tx) return doFind(tx);
    return ctx.issuer.public(ctx, doFind);
  }

  async findReports(
    ctx: IContext,
    params: {
      communityId: string;
      variant?: string;
      status?: ReportStatus;
      cursor?: string;
      first?: number;
    },
  ): Promise<{ items: PrismaReport[]; totalCount: number }> {
    const take = params.first ?? 20;
    const where: Prisma.ReportWhereInput = {
      communityId: params.communityId,
      ...(params.variant && { variant: params.variant }),
      status: params.status ?? { not: ReportStatus.SUPERSEDED },
    };
    return ctx.issuer.public(ctx, async (tx) => {
      const [items, totalCount] = await Promise.all([
        tx.report.findMany({
          where,
          select: reportSelect,
          take: take + 1,
          ...(params.cursor && { skip: 1, cursor: { id: params.cursor } }),
          orderBy: { createdAt: "desc" },
        }),
        tx.report.count({ where }),
      ]);
      return { items, totalCount };
    });
  }

  /**
   * sysAdmin cross-community report search. Distinct from `findReports`
   * (community-scoped, RLS-public): runs through `ctx.issuer.internal`
   * because the IsAdmin GraphQL directive is the only gatekeeper here,
   * and orders by publishedAt DESC NULLS LAST so DRAFT / SKIPPED rows
   * (publishedAt is null) sink rather than leading the page.
   *
   * Filters are all optional. The matching index
   * `idx_t_reports_published_at_created_at` (added in the
   * `add_admin_report_summary_columns` migration) backs the unfiltered
   * sweep; community / variant / status filters narrow before the
   * index sort completes.
   */
  async findAllReports(
    ctx: IContext,
    params: {
      communityId?: string;
      status?: ReportStatus;
      variant?: string;
      publishedAfter?: Date;
      publishedBefore?: Date;
      cursor?: string;
      first: number;
    },
  ): Promise<{ items: PrismaReport[]; totalCount: number }> {
    const where: Prisma.ReportWhereInput = {
      ...(params.communityId && { communityId: params.communityId }),
      ...(params.status && { status: params.status }),
      ...(params.variant && { variant: params.variant }),
      ...((params.publishedAfter || params.publishedBefore) && {
        publishedAt: {
          ...(params.publishedAfter && { gte: params.publishedAfter }),
          ...(params.publishedBefore && { lte: params.publishedBefore }),
        },
      }),
    };
    return ctx.issuer.internal(async (tx) => {
      const [items, totalCount] = await Promise.all([
        tx.report.findMany({
          where,
          select: reportSelect,
          take: params.first + 1,
          ...(params.cursor && { skip: 1, cursor: { id: params.cursor } }),
          orderBy: [
            { publishedAt: { sort: "desc", nulls: "last" } },
            { createdAt: "desc" },
            // id tie-breaker so `cursor: { id }` advances
            // deterministically when publishedAt + createdAt collide
            // (e.g. multiple reports created in the same millisecond
            // by a batch run, or the SKIPPED rows at the bottom that
            // share publishedAt=null).
            { id: "desc" },
          ],
        }),
        tx.report.count({ where }),
      ]);
      return { items, totalCount };
    });
  }

  /**
   * Per-community summary for `adminReportSummary`. Reads the
   * denormalized last-publish columns on `t_communities` directly so
   * the sort + cursor stay stable, then computes the rolling
   * 90-day publish count for the page's communityIds in a single
   * `GROUP BY` follow-up query — that count moves daily and is not
   * worth denormalizing, but the per-row correlated subquery shape
   * was needlessly O(first) under load.
   *
   * Sort `last_published_report_at ASC NULLS FIRST, id ASC` floats
   * dormant / never-published communities to the top so the L1 view
   * surfaces them first.
   *
   * Cursor pagination uses a *composite* cursor `{ at, id }` because
   * the primary sort key (`last_published_report_at`) is non-unique:
   * an `id`-only WHERE would skip rows whose at-value places them
   * after the cursor when their id happens to sort earlier. The two
   * branches below cover the NULLS-FIRST tier:
   *   - cursor.at === null (we're inside the dormant tier): keep
   *     paging through dormant rows by id, then spill over to the
   *     entire non-NULL tier.
   *   - cursor.at !== null (we're in the chronological tier): page
   *     by (at, id) lexicographically.
   */
  async findCommunityReportSummary(
    ctx: IContext,
    params: { cursor: CommunitySummaryCursor | null; first: number },
  ): Promise<{
    items: Array<{
      communityId: string;
      lastPublishedReportId: string | null;
      lastPublishedAt: Date | null;
      publishedCountLast90Days: number;
    }>;
    totalCount: number;
  }> {
    return ctx.issuer.internal(async (tx) => {
      // Wire-format decoding is the converter layer's job; this
      // method takes the already-decoded structured cursor (or null)
      // so the SQL composition stays pure data-layer.
      const { cursor } = params;
      const cursorClause = !cursor
        ? Prisma.empty
        : cursor.at === null
          ? Prisma.sql`AND (
              (c."last_published_report_at" IS NULL AND c."id" > ${cursor.id})
              OR c."last_published_report_at" IS NOT NULL
            )`
          : Prisma.sql`AND (
              c."last_published_report_at" > ${cursor.at}::timestamp
              OR (
                c."last_published_report_at" = ${cursor.at}::timestamp
                AND c."id" > ${cursor.id}
              )
            )`;
      // Two-query strategy: first page through communities by the
      // denormalized last-publish columns (one index range scan),
      // then aggregate the rolling 90-day publish count for just
      // that page's communityIds in a single GROUP BY. This keeps
      // DB round-trips and scan count constant in `first` rather
      // than O(first) correlated subqueries on the L1 hot path.
      const [rows, totalRow] = await Promise.all([
        tx.$queryRaw<
          {
            id: string;
            last_published_report_id: string | null;
            last_published_report_at: Date | null;
          }[]
        >`
          SELECT
            c."id",
            c."last_published_report_id",
            c."last_published_report_at"
          FROM "t_communities" c
          WHERE TRUE
            ${cursorClause}
          ORDER BY
            c."last_published_report_at" ASC NULLS FIRST,
            c."id" ASC
          LIMIT ${params.first + 1}
        `,
        tx.community.count(),
      ]);
      const communityIds = rows.map((r) => r.id);
      const counts =
        communityIds.length === 0
          ? []
          : await tx.$queryRaw<
              { community_id: string; count: bigint }[]
            >`
              SELECT
                r."community_id",
                COUNT(*)::bigint AS "count"
              FROM "t_reports" r
              WHERE r."community_id" = ANY(${communityIds}::text[])
                AND r."status" = 'PUBLISHED'
                AND r."published_at" IS NOT NULL
                AND r."published_at" >= NOW() - INTERVAL '90 days'
              GROUP BY r."community_id"
            `;
      const countByCommunity = new Map(
        counts.map((c) => [c.community_id, Number(c.count)]),
      );
      return {
        items: rows.map((r) => ({
          communityId: r.id,
          lastPublishedReportId: r.last_published_report_id,
          lastPublishedAt: r.last_published_report_at,
          publishedCountLast90Days: countByCommunity.get(r.id) ?? 0,
        })),
        totalCount: totalRow,
      };
    });
  }

  /**
   * Re-derive a community's last-publish pointer from `t_reports`.
   * Idempotent: callers can invoke it after either a publish (new
   * PUBLISHED row) or a supersede of a PUBLISHED row, and the column
   * pair will reflect the current state.
   *
   * One UPDATE always runs. When no PUBLISHED row remains, the
   * `LEFT JOIN ... ON FALSE` collapses `sub` to a single null row so
   * the SET expressions evaluate to NULL — keeping the operation in
   * a single statement instead of a conditional second UPDATE.
   */
  async recalculateCommunityLastPublished(
    ctx: IContext,
    communityId: string,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    await tx.$executeRaw`
      UPDATE "t_communities" c
      SET
        "last_published_report_id" = sub."id",
        "last_published_report_at" = sub."published_at"
      FROM (
        SELECT NULL::text AS "id", NULL::timestamp AS "published_at"
        UNION ALL
        SELECT "id", "published_at"
        FROM "t_reports"
        WHERE "community_id" = ${communityId}
          AND "status" = 'PUBLISHED'
          AND "published_at" IS NOT NULL
        -- "id" DESC tie-breaks ties on published_at (e.g. batched
        -- publishes inside the same millisecond) so two replays of
        -- the recalc against the same DB state always pick the same
        -- row, not whichever happens to scan first.
        ORDER BY "published_at" DESC NULLS LAST, "id" DESC
        LIMIT 1
      ) sub
      WHERE c."id" = ${communityId}
    `;
  }

  async updateReportStatus(
    ctx: IContext,
    id: string,
    status: ReportStatus,
    extra?: {
      publishedAt?: Date;
      publishedBy?: string;
      finalContent?: string;
    },
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaReport> {
    const doUpdate = (client: Prisma.TransactionClient) =>
      client.report.update({
        where: { id },
        data: { status, ...extra },
        select: reportSelect,
      });

    if (tx) return doUpdate(tx);
    return ctx.issuer.internal(doUpdate);
  }

  async findReportsByParentRunId(ctx: IContext, parentRunIds: string[]): Promise<PrismaReport[]> {
    if (parentRunIds.length === 0) return [];
    return ctx.issuer.public(ctx, (tx) =>
      tx.report.findMany({
        where: { parentRunId: { in: parentRunIds } },
        select: reportSelect,
        orderBy: { createdAt: "desc" },
      }),
    );
  }
}
