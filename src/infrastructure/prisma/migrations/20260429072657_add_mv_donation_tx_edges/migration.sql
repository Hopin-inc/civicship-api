-- ============================================================================
-- mv_donation_tx_edges
--
-- Tx-level normalized projection of DONATION transactions with sender/recipient
-- wallets resolved into user_id + community_id. Backs the analytics queries
-- that need a window-wide DISTINCT counterparty count or per-(community, user,
-- day) DONATION aggregation — `findMonthlyActivity` `hub_per_month`,
-- `findWindowHubMemberCountBulk`, and the donation_* CTEs inside
-- `findMemberStatsBulk`. Those previously scanned `t_transactions` joined
-- twice to `t_wallets` per request because
-- `mv_user_transaction_daily.unique_counterparties` is a per-day DISTINCT and
-- does not compose under SUM across multi-day windows.
--
-- Design notes:
--   - One row per DONATION transaction (no aggregation baked in). Consumers
--     do their own COUNT/SUM/DISTINCT, keeping the MV reusable for any
--     per-tenure, per-window, or per-day shape.
--   - Both `sender_community_id` and `recipient_community_id` are carried so
--     sender-keyed analytics (hub breadth, donation_activity,
--     donation_recipients) and receiver-keyed analytics (donation_received,
--     donation_senders) can both filter against the same MV without an extra
--     wallet JOIN.
--   - `(fw.user_id IS NOT NULL AND tw.user_id IS NOT NULL)` excludes burn /
--     system wallets so a system-issued grant cannot inflate any user's
--     send/receive breadth. `tw.user_id <> fw.user_id` excludes self-donations
--     (matches the "distinct OTHER users" wording in
--     AnalyticsMemberRow.uniqueDonationRecipients/Senders — the wallet
--     validator does not block same-user transfers, so the guard has to live
--     here).
--   - Cross-community guard `(fw.community_id IS NULL OR tw.community_id IS
--     NULL OR fw.community_id = tw.community_id)` mirrors the predicate the
--     consumers used inline + the predicate already applied by
--     `mv_user_transaction_daily` and `v_transaction_comments`.
--   - `COALESCE(fw.community_id, tw.community_id) IS NOT NULL` drops fully-
--     unattached rows that no consumer can filter in (every consumer keys by
--     a specific community_id).
--   - `date` is JST-bucketed using the same two-step UTC->JST cast as the
--     other report views (see 20260416000001_fix_report_views_jst_bucketing)
--     so consumer comparisons against `@db.Date`-encoded JST boundaries stay
--     consistent.
-- ============================================================================

CREATE MATERIALIZED VIEW "mv_donation_tx_edges" AS
SELECT
    t."id"                                                                  AS "transaction_id",
    t."created_at"                                                          AS "created_at",
    ((t."created_at" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo')::date)   AS "date",
    fw."community_id"                                                       AS "sender_community_id",
    tw."community_id"                                                       AS "recipient_community_id",
    fw."user_id"                                                            AS "sender_user_id",
    tw."user_id"                                                            AS "recipient_user_id",
    t."from_point_change"                                                   AS "from_point_change",
    t."to_point_change"                                                     AS "to_point_change",
    t."chain_depth"                                                         AS "chain_depth",
    t."parent_tx_id"                                                        AS "parent_tx_id"
FROM "t_transactions" t
INNER JOIN "t_wallets" fw
    ON fw."id" = t."from"
   AND fw."user_id" IS NOT NULL
INNER JOIN "t_wallets" tw
    ON tw."id" = t."to"
   AND tw."user_id" IS NOT NULL
   AND tw."user_id" <> fw."user_id"
WHERE t."reason" = 'DONATION'
  AND COALESCE(fw."community_id", tw."community_id") IS NOT NULL
  AND (fw."community_id" IS NULL
       OR tw."community_id" IS NULL
       OR fw."community_id" = tw."community_id");

-- Required for REFRESH MATERIALIZED VIEW CONCURRENTLY. transaction_id is
-- unique by construction (one source row per (t, fw, tw) tuple, and t has
-- a single from/to wallet pair).
CREATE UNIQUE INDEX "mv_donation_tx_edges_pkey"
    ON "mv_donation_tx_edges" ("transaction_id");

-- Sender-keyed range scans: hub_per_month, findWindowHubMemberCountBulk,
-- donation_activity, donation_recipients.
CREATE INDEX "mv_donation_tx_edges_sender_community_date_idx"
    ON "mv_donation_tx_edges" ("sender_community_id", "date" DESC);

-- Recipient-keyed range scans: donation_received, donation_senders.
CREATE INDEX "mv_donation_tx_edges_recipient_community_date_idx"
    ON "mv_donation_tx_edges" ("recipient_community_id", "date" DESC);
