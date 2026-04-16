-- ============================================================================
-- Transaction Report Views
--
-- Dataset for AI-generated weekly/periodic reports. Three materialized views
-- (daily aggregates) plus two regular views (raw comments, user profiles).
--
-- All day bucketing is done in Asia/Tokyo.
-- RLS does not apply to materialized views; application layer MUST filter by
-- community_id for every access.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- MV-1: mv_transaction_summary_daily
--   Granularity: (date, community_id, reason)
--   Purpose: Community-wide volume / reason breakdown / chain propagation
-- ----------------------------------------------------------------------------
CREATE MATERIALIZED VIEW "mv_transaction_summary_daily" AS
SELECT
    ((t."created_at" AT TIME ZONE 'Asia/Tokyo')::date) AS "date",
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
GROUP BY
    ((t."created_at" AT TIME ZONE 'Asia/Tokyo')::date),
    COALESCE(fw."community_id", tw."community_id"),
    t."reason";

CREATE UNIQUE INDEX "mv_transaction_summary_daily_unique_id"
    ON "mv_transaction_summary_daily" ("date", "community_id", "reason");

CREATE INDEX "mv_transaction_summary_daily_community_date_idx"
    ON "mv_transaction_summary_daily" ("community_id", "date" DESC);


-- ----------------------------------------------------------------------------
-- MV-2: mv_transaction_active_users_daily
--   Granularity: (date, community_id)
--   Purpose: DISTINCT active/sender/receiver user counts (not GROUP BY-able)
-- ----------------------------------------------------------------------------
CREATE MATERIALIZED VIEW "mv_transaction_active_users_daily" AS
WITH events AS (
    SELECT
        ((t."created_at" AT TIME ZONE 'Asia/Tokyo')::date) AS "date",
        COALESCE(fw."community_id", tw."community_id") AS "community_id",
        fw."user_id" AS "from_user_id",
        tw."user_id" AS "to_user_id"
    FROM "t_transactions" t
    LEFT JOIN "t_wallets" fw ON fw."id" = t."from"
    LEFT JOIN "t_wallets" tw ON tw."id" = t."to"
    WHERE COALESCE(fw."community_id", tw."community_id") IS NOT NULL
),
user_activity AS (
    SELECT "date", "community_id", "from_user_id" AS "user_id", 'sender' AS "role"
        FROM events WHERE "from_user_id" IS NOT NULL
    UNION ALL
    SELECT "date", "community_id", "to_user_id" AS "user_id", 'receiver' AS "role"
        FROM events WHERE "to_user_id" IS NOT NULL
)
SELECT
    "date",
    "community_id",
    COUNT(DISTINCT "user_id")::int AS "active_users",
    COUNT(DISTINCT "user_id") FILTER (WHERE "role" = 'sender')::int AS "senders",
    COUNT(DISTINCT "user_id") FILTER (WHERE "role" = 'receiver')::int AS "receivers"
FROM user_activity
GROUP BY "date", "community_id";

CREATE UNIQUE INDEX "mv_transaction_active_users_daily_unique_id"
    ON "mv_transaction_active_users_daily" ("date", "community_id");


-- ----------------------------------------------------------------------------
-- MV-3: mv_user_transaction_daily
--   Granularity: (date, community_id, user_id, wallet_id)
--   Purpose: Per-user activity / contribution ranking / AI highlight picking
-- ----------------------------------------------------------------------------
CREATE MATERIALIZED VIEW "mv_user_transaction_daily" AS
WITH user_events AS (
    -- Outgoing (user is the `from` side)
    SELECT
        ((t."created_at" AT TIME ZONE 'Asia/Tokyo')::date) AS "date",
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
    UNION ALL
    -- Incoming (user is the `to` side)
    SELECT
        ((t."created_at" AT TIME ZONE 'Asia/Tokyo')::date) AS "date",
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
-- VIEW-4: v_transaction_comments (regular view, real-time)
--   Granularity: per transaction with non-empty comment
--   Purpose: AI-input qualitative data
-- ----------------------------------------------------------------------------
CREATE VIEW "v_transaction_comments" AS
SELECT
    t."id" AS "transaction_id",
    ((t."created_at" AT TIME ZONE 'Asia/Tokyo')::date) AS "date",
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
WHERE t."comment" IS NOT NULL AND t."comment" <> '';


-- ----------------------------------------------------------------------------
-- VIEW-5: v_user_profile_for_report (regular view, real-time)
--   Granularity: (user, community)
--   Purpose: AI-input profile context (bio/headline/joined_at)
-- ----------------------------------------------------------------------------
CREATE VIEW "v_user_profile_for_report" AS
SELECT
    u."id" AS "user_id",
    m."community_id" AS "community_id",
    u."name" AS "name",
    u."bio" AS "user_bio",
    m."bio" AS "membership_bio",
    m."headline" AS "headline",
    m."role" AS "role",
    m."created_at" AS "joined_at"
FROM "t_users" u
INNER JOIN "t_memberships" m ON m."user_id" = u."id";
