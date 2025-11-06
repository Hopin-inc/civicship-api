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
    -- Drop old policies if exist
    EXECUTE format('DROP POLICY IF EXISTS community_isolation_policy ON %I;', tbl);
EXECUTE format('DROP POLICY IF EXISTS community_write_policy ON %I;', tbl);
EXECUTE format('DROP POLICY IF EXISTS community_bypass_policy ON %I;', tbl);

-- Disable FORCE RLS if previously set
EXECUTE format('ALTER TABLE %I NO FORCE ROW LEVEL SECURITY;', tbl);
END LOOP;
END $$;

-- =============================================================
-- ✅ RLS: Mutation対象テーブルのみ適用（軽量・安全構成）
-- =============================================================

-- 1. Enable RLS only on mutation-related tables
ALTER TABLE "t_wallets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "t_reservations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "t_participations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "t_transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "t_tickets" ENABLE ROW LEVEL SECURITY;

-- 2. Do NOT force RLS globally (allows read bypass and system jobs)
-- FORCE ROW LEVEL SECURITY は付けない


-- =============================================================
-- 🔒 Community Isolation Policy (Write isolation)
-- -------------------------------------------------------------
-- app.rls_config.user_id に設定された user_id を元に、
-- memberships 経由で community_id を制約する。
-- =============================================================

CREATE POLICY community_write_policy ON "t_wallets"
  FOR ALL
  USING (
    "community_id" IN (
      SELECT "community_id"
      FROM "t_memberships"
      WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id', true), '')::text
    )
  );

CREATE POLICY community_write_policy ON "t_reservations"
  FOR ALL
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

CREATE POLICY community_write_policy ON "t_participations"
  FOR ALL
  USING (
    "community_id" IN (
      SELECT "community_id"
      FROM "t_memberships"
      WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id', true), '')::text
    )
  );

CREATE POLICY community_write_policy ON "t_transactions"
  FOR ALL
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

CREATE POLICY community_write_policy ON "t_tickets"
  FOR ALL
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
-- 🪄 Bypass Policy
-- -------------------------------------------------------------
-- set_config('app.rls_bypass', 'on', true) により、
-- バッチ・migration・read replica などのRLSスキップを許可
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

-- =============================================================
-- ✅ Summary:
--   - RLS enabled only for mutation targets
--   - Read queries remain unrestricted (fast)
--   - Bypass available for system-level ops
-- =============================================================