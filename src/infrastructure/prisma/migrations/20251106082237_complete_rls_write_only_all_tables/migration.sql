-- =============================================================
-- =============================================================

DO $$
DECLARE
tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    't_places', 't_utilities', 't_articles', 't_wallets', 't_opportunities',
    't_opportunity_slots', 't_reservations', 't_participations', 't_evaluations',
    't_transactions', 't_ticket_issuers', 't_ticket_claim_links', 't_tickets'
  ]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS community_isolation_policy ON %I;', tbl);
    EXECUTE format('DROP POLICY IF EXISTS community_write_policy ON %I;', tbl);
    EXECUTE format('DROP POLICY IF EXISTS community_select_policy ON %I;', tbl);
    EXECUTE format('DROP POLICY IF EXISTS community_update_policy ON %I;', tbl);
    EXECUTE format('DROP POLICY IF EXISTS community_update_delete_policy ON %I;', tbl);
    EXECUTE format('DROP POLICY IF EXISTS community_delete_policy ON %I;', tbl);
    EXECUTE format('DROP POLICY IF EXISTS community_bypass_policy ON %I;', tbl);
    
    EXECUTE format('ALTER TABLE %I NO FORCE ROW LEVEL SECURITY;', tbl);
  END LOOP;
END $$;

-- =============================================================
-- =============================================================

ALTER TABLE "t_places" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "t_utilities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "t_articles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "t_wallets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "t_opportunities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "t_opportunity_slots" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "t_reservations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "t_participations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "t_evaluations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "t_transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "t_ticket_issuers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "t_ticket_claim_links" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "t_tickets" ENABLE ROW LEVEL SECURITY;

-- =============================================================
-- =============================================================

DO $$
DECLARE
tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    't_places', 't_utilities', 't_articles', 't_wallets', 't_opportunities',
    't_opportunity_slots', 't_reservations', 't_participations', 't_evaluations',
    't_transactions', 't_ticket_issuers', 't_ticket_claim_links', 't_tickets'
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
-- =============================================================

CREATE POLICY community_write_policy ON "t_places"
  FOR INSERT
  WITH CHECK (
    "community_id" IN (
      SELECT "community_id"
      FROM "t_memberships"
      WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id', true), '')::text
    )
  );

CREATE POLICY community_update_policy ON "t_places"
  FOR UPDATE
  USING (
    "community_id" IN (
      SELECT "community_id"
      FROM "t_memberships"
      WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id', true), '')::text
    )
  );

CREATE POLICY community_delete_policy ON "t_places"
  FOR DELETE
  USING (
    "community_id" IN (
      SELECT "community_id"
      FROM "t_memberships"
      WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id', true), '')::text
    )
  );

CREATE POLICY community_write_policy ON "t_utilities"
  FOR INSERT
  WITH CHECK (
    "community_id" IN (
      SELECT "community_id"
      FROM "t_memberships"
      WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id', true), '')::text
    )
  );

CREATE POLICY community_update_policy ON "t_utilities"
  FOR UPDATE
  USING (
    "community_id" IN (
      SELECT "community_id"
      FROM "t_memberships"
      WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id', true), '')::text
    )
  );

CREATE POLICY community_delete_policy ON "t_utilities"
  FOR DELETE
  USING (
    "community_id" IN (
      SELECT "community_id"
      FROM "t_memberships"
      WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id', true), '')::text
    )
  );

CREATE POLICY community_write_policy ON "t_articles"
  FOR INSERT
  WITH CHECK (
    "community_id" IN (
      SELECT "community_id"
      FROM "t_memberships"
      WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id', true), '')::text
    )
  );

CREATE POLICY community_update_policy ON "t_articles"
  FOR UPDATE
  USING (
    "community_id" IN (
      SELECT "community_id"
      FROM "t_memberships"
      WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id', true), '')::text
    )
  );

CREATE POLICY community_delete_policy ON "t_articles"
  FOR DELETE
  USING (
    "community_id" IN (
      SELECT "community_id"
      FROM "t_memberships"
      WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id', true), '')::text
    )
  );

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

CREATE POLICY community_update_policy ON "t_wallets"
  FOR UPDATE
  USING (
    "community_id" IN (
      SELECT "community_id"
      FROM "t_memberships"
      WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id', true), '')::text
    )
  );

CREATE POLICY community_delete_policy ON "t_wallets"
  FOR DELETE
  USING (
    "community_id" IN (
      SELECT "community_id"
      FROM "t_memberships"
      WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id', true), '')::text
    )
  );

CREATE POLICY community_write_policy ON "t_opportunities"
  FOR INSERT
  WITH CHECK (
    "community_id" IN (
      SELECT "community_id"
      FROM "t_memberships"
      WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id', true), '')::text
    )
  );

CREATE POLICY community_update_policy ON "t_opportunities"
  FOR UPDATE
  USING (
    "community_id" IN (
      SELECT "community_id"
      FROM "t_memberships"
      WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id', true), '')::text
    )
  );

CREATE POLICY community_delete_policy ON "t_opportunities"
  FOR DELETE
  USING (
    "community_id" IN (
      SELECT "community_id"
      FROM "t_memberships"
      WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id', true), '')::text
    )
  );

CREATE POLICY community_write_policy ON "t_opportunity_slots"
  FOR INSERT
  WITH CHECK (
    "opportunity_id" IN (
      SELECT "id" FROM "t_opportunities"
      WHERE "community_id" IN (
        SELECT "community_id"
        FROM "t_memberships"
        WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id', true), '')::text
      )
    )
  );

CREATE POLICY community_update_policy ON "t_opportunity_slots"
  FOR UPDATE
  USING (
    "opportunity_id" IN (
      SELECT "id" FROM "t_opportunities"
      WHERE "community_id" IN (
        SELECT "community_id"
        FROM "t_memberships"
        WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id', true), '')::text
      )
    )
  );

CREATE POLICY community_delete_policy ON "t_opportunity_slots"
  FOR DELETE
  USING (
    "opportunity_id" IN (
      SELECT "id" FROM "t_opportunities"
      WHERE "community_id" IN (
        SELECT "community_id"
        FROM "t_memberships"
        WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id', true), '')::text
      )
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

CREATE POLICY community_update_policy ON "t_reservations"
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

CREATE POLICY community_delete_policy ON "t_reservations"
  FOR DELETE
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

CREATE POLICY community_update_policy ON "t_participations"
  FOR UPDATE
  USING (
    "community_id" IN (
      SELECT "community_id"
      FROM "t_memberships"
      WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id', true), '')::text
    )
  );

CREATE POLICY community_delete_policy ON "t_participations"
  FOR DELETE
  USING (
    "community_id" IN (
      SELECT "community_id"
      FROM "t_memberships"
      WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id', true), '')::text
    )
  );

CREATE POLICY community_write_policy ON "t_evaluations"
  FOR INSERT
  WITH CHECK (
    "participation_id" IN (
      SELECT "id" FROM "t_participations"
      WHERE "community_id" IN (
        SELECT "community_id"
        FROM "t_memberships"
        WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id', true), '')::text
      )
    )
  );

CREATE POLICY community_update_policy ON "t_evaluations"
  FOR UPDATE
  USING (
    "participation_id" IN (
      SELECT "id" FROM "t_participations"
      WHERE "community_id" IN (
        SELECT "community_id"
        FROM "t_memberships"
        WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id', true), '')::text
      )
    )
  );

CREATE POLICY community_delete_policy ON "t_evaluations"
  FOR DELETE
  USING (
    "participation_id" IN (
      SELECT "id" FROM "t_participations"
      WHERE "community_id" IN (
        SELECT "community_id"
        FROM "t_memberships"
        WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id', true), '')::text
      )
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

CREATE POLICY community_update_policy ON "t_transactions"
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

CREATE POLICY community_delete_policy ON "t_transactions"
  FOR DELETE
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

CREATE POLICY community_write_policy ON "t_ticket_issuers"
  FOR INSERT
  WITH CHECK (
    "utility_id" IN (
      SELECT "id" FROM "t_utilities"
      WHERE "community_id" IN (
        SELECT "community_id"
        FROM "t_memberships"
        WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id', true), '')::text
      )
    )
  );

CREATE POLICY community_update_policy ON "t_ticket_issuers"
  FOR UPDATE
  USING (
    "utility_id" IN (
      SELECT "id" FROM "t_utilities"
      WHERE "community_id" IN (
        SELECT "community_id"
        FROM "t_memberships"
        WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id', true), '')::text
      )
    )
  );

CREATE POLICY community_delete_policy ON "t_ticket_issuers"
  FOR DELETE
  USING (
    "utility_id" IN (
      SELECT "id" FROM "t_utilities"
      WHERE "community_id" IN (
        SELECT "community_id"
        FROM "t_memberships"
        WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id', true), '')::text
      )
    )
  );

CREATE POLICY community_write_policy ON "t_ticket_claim_links"
  FOR INSERT
  WITH CHECK (
    "issuer_id" IN (
      SELECT "id" FROM "t_ticket_issuers"
      WHERE "utility_id" IN (
        SELECT "id" FROM "t_utilities"
        WHERE "community_id" IN (
          SELECT "community_id"
          FROM "t_memberships"
          WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id', true), '')::text
        )
      )
    )
  );

CREATE POLICY community_update_policy ON "t_ticket_claim_links"
  FOR UPDATE
  USING (
    "issuer_id" IN (
      SELECT "id" FROM "t_ticket_issuers"
      WHERE "utility_id" IN (
        SELECT "id" FROM "t_utilities"
        WHERE "community_id" IN (
          SELECT "community_id"
          FROM "t_memberships"
          WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id', true), '')::text
        )
      )
    )
  );

CREATE POLICY community_delete_policy ON "t_ticket_claim_links"
  FOR DELETE
  USING (
    "issuer_id" IN (
      SELECT "id" FROM "t_ticket_issuers"
      WHERE "utility_id" IN (
        SELECT "id" FROM "t_utilities"
        WHERE "community_id" IN (
          SELECT "community_id"
          FROM "t_memberships"
          WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id', true), '')::text
        )
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

CREATE POLICY community_update_policy ON "t_tickets"
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

CREATE POLICY community_delete_policy ON "t_tickets"
  FOR DELETE
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
-- =============================================================

DO $$
DECLARE
tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    't_places', 't_utilities', 't_articles', 't_wallets', 't_opportunities',
    't_opportunity_slots', 't_reservations', 't_participations', 't_evaluations',
    't_transactions', 't_ticket_issuers', 't_ticket_claim_links', 't_tickets'
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
--   - Bypass available for system-level operations
-- =============================================================
