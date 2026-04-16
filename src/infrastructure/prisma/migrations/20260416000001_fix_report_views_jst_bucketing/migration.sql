-- ============================================================================
-- Fix JST day-bucketing in report views
--
-- The previous migration used `t.created_at AT TIME ZONE 'Asia/Tokyo'`, but
-- t_transactions.created_at is `timestamp without time zone` (Prisma
-- `DateTime` default) holding naive UTC values. In that case
-- `AT TIME ZONE 'Asia/Tokyo'` treats the value AS JST and reinterprets it
-- (subtracting 9h), producing a date one day earlier than the real JST date
-- during the 00:00-08:59 JST window.
--
-- The correct two-step conversion is:
--   created_at AT TIME ZONE 'UTC'  -- "this naive value is UTC" -> timestamptz
--              AT TIME ZONE 'Asia/Tokyo'  -- render that UTC in JST -> naive
--
-- This migration drops and recreates the three views that day-bucketed with
-- the wrong expression. Schema (column names / types) is unchanged, so the
-- Prisma view models keep working without regeneration.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- MV-1: mv_transaction_summary_daily
-- ----------------------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS "mv_transaction_summary_daily";

CREATE MATERIALIZED VIEW "mv_transaction_summary_daily" AS
SELECT
    ((t."created_at" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo')::date) AS "date",
    COALESCE(fw."community_id", tw."community_id") AS "community_id",
    t."reason" AS "reason",
    COUNT(*)::int AS "tx_count",
    COALESCE(SUM(t."to_point_change"), 0)::bigint AS "points_sum",
    COUNT(*) FILTER (WHERE t."chain_depth" = 1)::int AS "chain_root_count",
    COUNT(*) FILTER (WHERE t."chain_depth" >= 2)::int AS "chain_descendant_count",
    MAX(t."chain_depth")::int AS "max_chain_depth",
    COALESCE(SUM(t."chain_depth"), 0)::int AS "sum_chain_depth",
    COUNT(*) FILTER (WHERE t."from" IS NULL)::int AS "issuance_count",
    COUNT(*) FILTER (WHERE t."to" IS NULL)::int AS "burn_count"
FROM "t_transactions" t
LEFT JOIN "t_wallets" fw ON fw."id" = t."from"
LEFT JOIN "t_wallets" tw ON tw."id" = t."to"
WHERE COALESCE(fw."community_id", tw."community_id") IS NOT NULL
  AND (fw."community_id" IS NULL
       OR tw."community_id" IS NULL
       OR fw."community_id" = tw."community_id")
GROUP BY
    ((t."created_at" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo')::date),
    COALESCE(fw."community_id", tw."community_id"),
    t."reason";

CREATE UNIQUE INDEX "mv_transaction_summary_daily_unique_id"
    ON "mv_transaction_summary_daily" ("date", "community_id", "reason");

CREATE INDEX "mv_transaction_summary_daily_community_date_idx"
    ON "mv_transaction_summary_daily" ("community_id", "date" DESC);


-- ----------------------------------------------------------------------------
-- MV-3: mv_user_transaction_daily
-- ----------------------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS "mv_user_transaction_daily";

CREATE MATERIALIZED VIEW "mv_user_transaction_daily" AS
WITH user_events AS (
    -- Outgoing (user is the `from` side)
    SELECT
        ((t."created_at" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo')::date) AS "date",
        fw."community_id" AS "community_id",
        fw."user_id" AS "user_id",
        fw."id" AS "wallet_id",
        'out'::text AS "direction",
        t."reason" AS "reason",
        t."to_point_change" AS "points",
        t."chain_depth" AS "chain_depth",
        tw."user_id" AS "counterparty_user_id"
    FROM "t_transactions" t
    INNER JOIN "t_wallets" fw ON fw."id" = t."from" AND fw."user_id" IS NOT NULL
    LEFT JOIN "t_wallets" tw ON tw."id" = t."to"
    WHERE tw."community_id" IS NULL
       OR tw."community_id" = fw."community_id"
    UNION ALL
    -- Incoming (user is the `to` side)
    SELECT
        ((t."created_at" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo')::date) AS "date",
        tw."community_id" AS "community_id",
        tw."user_id" AS "user_id",
        tw."id" AS "wallet_id",
        'in'::text AS "direction",
        t."reason" AS "reason",
        t."to_point_change" AS "points",
        t."chain_depth" AS "chain_depth",
        fw."user_id" AS "counterparty_user_id"
    FROM "t_transactions" t
    INNER JOIN "t_wallets" tw ON tw."id" = t."to" AND tw."user_id" IS NOT NULL
    LEFT JOIN "t_wallets" fw ON fw."id" = t."from"
    WHERE fw."community_id" IS NULL
       OR fw."community_id" = tw."community_id"
)
SELECT
    "date",
    "community_id",
    "user_id",
    "wallet_id",
    COUNT(*) FILTER (WHERE "direction" = 'in')::int AS "tx_count_in",
    COUNT(*) FILTER (WHERE "direction" = 'out')::int AS "tx_count_out",
    COALESCE(SUM("points") FILTER (WHERE "direction" = 'in'), 0)::bigint AS "points_in",
    COALESCE(SUM("points") FILTER (WHERE "direction" = 'out'), 0)::bigint AS "points_out",
    COUNT(*) FILTER (WHERE "direction" = 'out' AND "reason" = 'DONATION')::int AS "donation_out_count",
    COALESCE(SUM("points") FILTER (WHERE "direction" = 'out' AND "reason" = 'DONATION'), 0)::bigint AS "donation_out_points",
    COUNT(*) FILTER (WHERE "direction" = 'in' AND "reason" = 'DONATION')::int AS "received_donation_count",
    COUNT(*) FILTER (WHERE "direction" = 'out' AND "chain_depth" = 1)::int AS "chain_root_count",
    MAX("chain_depth") FILTER (WHERE "direction" = 'out')::int AS "max_chain_depth_started",
    MAX("chain_depth") FILTER (WHERE "direction" = 'in')::int AS "chain_depth_reached_max",
    COUNT(DISTINCT "counterparty_user_id")::int AS "unique_counterparties"
FROM user_events
GROUP BY "date", "community_id", "user_id", "wallet_id";

CREATE UNIQUE INDEX "mv_user_transaction_daily_unique_id"
    ON "mv_user_transaction_daily" ("date", "community_id", "user_id", "wallet_id");

CREATE INDEX "mv_user_transaction_daily_community_date_idx"
    ON "mv_user_transaction_daily" ("community_id", "date" DESC);


-- ----------------------------------------------------------------------------
-- VIEW-4: v_transaction_comments
-- ----------------------------------------------------------------------------
DROP VIEW IF EXISTS "v_transaction_comments";

CREATE VIEW "v_transaction_comments" AS
SELECT
    t."id" AS "transaction_id",
    ((t."created_at" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo')::date) AS "date",
    t."created_at" AS "created_at",
    COALESCE(fw."community_id", tw."community_id") AS "community_id",
    fw."user_id" AS "from_user_id",
    tw."user_id" AS "to_user_id",
    t."created_by" AS "created_by_user_id",
    t."reason" AS "reason",
    t."to_point_change" AS "points",
    t."comment" AS "comment",
    t."chain_depth" AS "chain_depth"
FROM "t_transactions" t
LEFT JOIN "t_wallets" fw ON fw."id" = t."from"
LEFT JOIN "t_wallets" tw ON tw."id" = t."to"
WHERE t."comment" IS NOT NULL
  AND t."comment" <> ''
  AND COALESCE(fw."community_id", tw."community_id") IS NOT NULL
  AND (fw."community_id" IS NULL
       OR tw."community_id" IS NULL
       OR fw."community_id" = tw."community_id");
