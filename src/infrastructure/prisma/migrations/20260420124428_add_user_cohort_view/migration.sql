-- ============================================================================
-- v_user_cohort
--
-- Per-(community_id, user_id) cohort metadata used to annotate the AI report
-- payload with "when did this person first join and first act?". Regular VIEW
-- (not materialized) so there is no refresh job to schedule and queries always
-- reflect the latest memberships / transactions.
--
-- Scope: read-only join over t_memberships + t_transactions. RLS on
-- t_memberships still applies at query time; the report repository scopes
-- lookups to callers that belong to the target community (or internal
-- admin issuer) before invoking queries that reference this view.
--
-- `onboarding_week` comes from t_memberships.created_at (JOINED semantics
-- are left to the caller's WHERE clause) rather than an ONBOARDING
-- transaction because the bonus tx has operational noise around re-issuance
-- / manual grants that we don't want to leak into cohort math.
--
-- `first_active_week` is the first week the user was on the FROM side of a
-- transaction (i.e. actively sent, not just received) — matches the
-- `is_sender` signal used by the retention aggregate queries so
-- weeks_since_join and the retention numbers tell a consistent story.
-- ============================================================================

CREATE VIEW "v_user_cohort" AS
WITH membership_cohort AS (
    SELECT
        m."community_id",
        m."user_id",
        DATE_TRUNC(
            'week',
            m."created_at" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo'
        )::date AS "onboarding_week"
    FROM "t_memberships" m
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
    GROUP BY fw."community_id", fw."user_id"
)
SELECT
    mc."community_id",
    mc."user_id",
    mc."onboarding_week",
    fa."first_active_week",
    -- `CURRENT_DATE - date` returns integer (days) in Postgres, so divide
    -- by 7 directly rather than EXTRACT(EPOCH FROM interval) / 604800 which
    -- only works on timestamp subtraction. Cast to float so the quotient
    -- preserves fractional weeks.
    (CURRENT_DATE - COALESCE(mc."onboarding_week", fa."first_active_week"))::float / 7
        AS "total_weeks_in_community"
FROM membership_cohort mc
LEFT JOIN first_active fa
    ON fa."community_id" = mc."community_id"
   AND fa."user_id" = mc."user_id";