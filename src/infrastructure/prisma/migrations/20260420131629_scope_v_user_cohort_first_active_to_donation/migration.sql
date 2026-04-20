-- ============================================================================
-- Align v_user_cohort.first_active_week with the retention `is_sender` frame
--
-- The previous definition (20260420124428_add_user_cohort_view) picked the
-- earliest t_transactions.created_at where the user was on the FROM side,
-- regardless of `reason`. The surrounding comment claimed this "matches the
-- is_sender signal used by the retention aggregate queries", but
-- `is_sender` is defined as `donation_out_count > 0` in
-- findRetentionAggregate / findCohortRetention — i.e. DONATION transactions
-- only. ONBOARDING / GRANT / POINT_ISSUED / POINT_REWARD transactions have
-- a user on the FROM side too (admin issuance flows), so the old view would
-- pull first_active_week earlier than when the user first *donated* on
-- those communities, making weeks_since_first_active inconsistent with
-- the retention numbers.
--
-- Add `WHERE t.reason = 'DONATION'` so the view's "active" semantics match
-- the retention aggregate queries exactly. Schema (columns / types) is
-- unchanged, so `CREATE OR REPLACE VIEW` is sufficient and no Prisma
-- regeneration is needed.
-- ============================================================================

CREATE OR REPLACE VIEW "v_user_cohort" AS
WITH membership_cohort AS (
    SELECT
        m."community_id",
        m."user_id",
        DATE_TRUNC(
            'week',
            m."created_at" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo'
        )::date AS "onboarding_week"
    FROM "t_memberships" m
    WHERE m."status" = 'JOINED'
),
first_active AS (
    SELECT
        fw."community_id",
        fw."user_id",
        DATE_TRUNC(
            'week',
            MIN(t."created_at") AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo'
        )::date AS "first_active_week"
    FROM "t_transactions" t
    INNER JOIN "t_wallets" fw
        ON fw."id" = t."from"
       AND fw."user_id" IS NOT NULL
    WHERE t."reason" = 'DONATION'
    GROUP BY fw."community_id", fw."user_id"
)
SELECT
    mc."community_id",
    mc."user_id",
    mc."onboarding_week",
    fa."first_active_week",
    -- JST-truncated "today" rather than `CURRENT_DATE`, which reads the DB
    -- server's timezone setting and would drift from the rest of this
    -- codebase (every other date math uses `AT TIME ZONE 'Asia/Tokyo'`).
    -- `date - date` returns integer (days) in Postgres, so divide by 7
    -- directly rather than EXTRACT(EPOCH FROM interval) / 604800 which
    -- only works on timestamp subtraction. Cast to float so the quotient
    -- preserves fractional weeks.
    (
        (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Tokyo')::date
        - COALESCE(mc."onboarding_week", fa."first_active_week")
    )::float / 7 AS "total_weeks_in_community"
FROM membership_cohort mc
LEFT JOIN first_active fa
    ON fa."community_id" = mc."community_id"
   AND fa."user_id" = mc."user_id";
