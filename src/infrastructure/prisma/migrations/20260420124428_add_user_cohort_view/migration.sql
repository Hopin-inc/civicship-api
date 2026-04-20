-- ============================================================================
-- v_user_cohort
--
-- Per-(community_id, user_id) cohort metadata used to annotate the AI report
-- payload with "when did this person first join and first act?". Regular VIEW
-- (not materialized) so there is no refresh job to schedule and queries always
-- reflect the latest memberships / transactions.
--
-- Scope: read-only join over t_memberships + t_transactions. Callers must
-- scope queries by community_id in the application layer before referencing
-- this view; some code paths (ctx.issuer.public / internal) set
-- app.rls_bypass='on', so safety must NOT rely on t_memberships RLS being
-- enforced at query time.
--
-- `onboarding_week` comes from t_memberships.created_at, filtered to
-- status = 'JOINED' directly in the view so downstream consumers can
-- read `v_user_cohort` without re-adding the churn filter — a
-- view named `v_user_cohort` that silently includes withdrawn members
-- would be a footgun for future callers. We pick created_at over the
-- ONBOARDING transaction because the bonus tx has operational noise
-- around re-issuance / manual grants that we don't want to leak into
-- cohort math.
--
-- `first_active_week` is the first week the user appeared on the FROM side
-- of any transaction in this view definition (i.e. actively sent, not just
-- received). Note that this initial migration does NOT filter
-- `t_transactions.reason`, so ONBOARDING / GRANT / POINT_ISSUED etc. all
-- contribute here — the "matches the is_sender signal" alignment with the
-- retention aggregate queries (which are DONATION-scoped) is tightened in
-- a follow-up migration (20260420131629_scope_v_user_cohort_first_active_to_donation)
-- that replaces this definition.
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