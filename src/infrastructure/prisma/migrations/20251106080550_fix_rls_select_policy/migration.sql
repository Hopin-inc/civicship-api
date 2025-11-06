-- =============================================================
-- 🧹 Cleanup existing RLS state
-- =============================================================

DO $$
DECLARE
tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    't_wallets','t_reservations','t_participations','t_transactions','t_tickets'
  ]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS community_isolation_policy ON %I;', tbl);
EXECUTE format('DROP POLICY IF EXISTS community_write_policy ON %I;', tbl);
EXECUTE format('DROP POLICY IF EXISTS community_select_policy ON %I;', tbl);
EXECUTE format('DROP POLICY IF EXISTS community_update_policy ON %I;', tbl);
EXECUTE format('DROP POLICY IF EXISTS community_delete_policy ON %I;', tbl);
EXECUTE format('DROP POLICY IF EXISTS community_bypass_policy ON %I;', tbl);
EXECUTE format('ALTER TABLE %I NO FORCE ROW LEVEL SECURITY;', tbl);
END LOOP;
END $$;

-- =============================================================
-- ✅ Enable RLS (not FORCE)
-- =============================================================

ALTER TABLE "t_wallets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "t_reservations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "t_participations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "t_transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "t_tickets" ENABLE ROW LEVEL SECURITY;

-- =============================================================
-- 🔓 SELECT Policy: 無制限（アプリケーション層でフィルタ）
-- =============================================================

DO $$
DECLARE
tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    't_wallets','t_reservations','t_participations','t_transactions','t_tickets'
  ]
  LOOP
    EXECUTE format($f$
      CREATE POLICY community_select_policy ON %I
      FOR SELECT
      USING (true);
    $f$, tbl);
END LOOP;
END $$;

-- =============================================================
-- 🔒 WRITE Policy: コミュニティ分離
-- =============================================================

-- t_wallets
CREATE POLICY community_write_policy ON "t_wallets"
  FOR INSERT
  WITH CHECK (
    "community_id" IN (
      SELECT "community_id"
      FROM "t_memberships"
      WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id', true), '')::text
    )
  );

CREATE POLICY community_update_delete_policy ON "t_wallets"
  FOR UPDATE
                        USING (
                        "community_id" IN (
                        SELECT "community_id"
                        FROM "t_memberships"
                        WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id', true), '')::text
                        )
                        );

-- t_reservations
CREATE POLICY community_write_policy ON "t_reservations"
  FOR INSERT
  WITH CHECK (
    "opportunity_slot_id" IN (
      SELECT "id" FROM "t_opportunity_slots"
      WHERE "opportunity_id" IN (
        SELECT "id" FROM "t_opportunities"
        WHERE "community_id" IN (
          SELECT "community_id"
          FROM "t_memberships"
          WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id', true), '')::text
        )
      )
    )
  );

CREATE POLICY community_update_delete_policy ON "t_reservations"
  FOR UPDATE
                        USING (
                        "opportunity_slot_id" IN (
                        SELECT "id" FROM "t_opportunity_slots"
                        WHERE "opportunity_id" IN (
                        SELECT "id" FROM "t_opportunities"
                        WHERE "community_id" IN (
                        SELECT "community_id"
                        FROM "t_memberships"
                        WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id', true), '')::text
                        )
                        )
                        )
                        );

-- t_participations
CREATE POLICY community_write_policy ON "t_participations"
  FOR INSERT
  WITH CHECK (
    "community_id" IN (
      SELECT "community_id"
      FROM "t_memberships"
      WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id', true), '')::text
    )
  );

CREATE POLICY community_update_delete_policy ON "t_participations"
  FOR UPDATE
                        USING (
                        "community_id" IN (
                        SELECT "community_id"
                        FROM "t_memberships"
                        WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id', true), '')::text
                        )
                        );

-- t_transactions
CREATE POLICY community_write_policy ON "t_transactions"
  FOR INSERT
  WITH CHECK (
    "from" IN (
      SELECT "id" FROM "t_wallets"
      WHERE "community_id" IN (
        SELECT "community_id"
        FROM "t_memberships"
        WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id', true), '')::text
      )
    )
    OR
    "to" IN (
      SELECT "id" FROM "t_wallets"
      WHERE "community_id" IN (
        SELECT "community_id"
        FROM "t_memberships"
        WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id', true), '')::text
      )
    )
  );

CREATE POLICY community_update_delete_policy ON "t_transactions"
  FOR UPDATE
                        USING (
                        "from" IN (
                        SELECT "id" FROM "t_wallets"
                        WHERE "community_id" IN (
                        SELECT "community_id"
                        FROM "t_memberships"
                        WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id', true), '')::text
                        )
                        )
                        OR
                        "to" IN (
                        SELECT "id" FROM "t_wallets"
                        WHERE "community_id" IN (
                        SELECT "community_id"
                        FROM "t_memberships"
                        WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id', true), '')::text
                        )
                        )
                        );

-- t_tickets
CREATE POLICY community_write_policy ON "t_tickets"
  FOR INSERT
  WITH CHECK (
    "wallet_id" IN (
      SELECT "id"
      FROM "t_wallets"
      WHERE "community_id" IN (
        SELECT "community_id"
        FROM "t_memberships"
        WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id', true), '')::text
      )
    )
  );

CREATE POLICY community_update_delete_policy ON "t_tickets"
  FOR UPDATE
                        USING (
                        "wallet_id" IN (
                        SELECT "id"
                        FROM "t_wallets"
                        WHERE "community_id" IN (
                        SELECT "community_id"
                        FROM "t_memberships"
                        WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id', true), '')::text
                        )
                        )
                        );

-- =============================================================
-- 🪄 Bypass Policy（システム処理用）
-- =============================================================

DO $$
DECLARE
tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    't_wallets','t_reservations','t_participations','t_transactions','t_tickets'
  ]
  LOOP
    EXECUTE format($f$
      CREATE POLICY community_bypass_policy ON %I
      USING (NULLIF(current_setting('app.rls_bypass', true), 'off')::text = 'on');
    $f$, tbl);
END LOOP;
END $$;