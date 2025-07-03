-- This is an empty migration.
-- Enable RLS
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

-- Force RLS
ALTER TABLE "t_places" FORCE ROW LEVEL SECURITY;
ALTER TABLE "t_utilities" FORCE ROW LEVEL SECURITY;
ALTER TABLE "t_articles" FORCE ROW LEVEL SECURITY;
ALTER TABLE "t_wallets" FORCE ROW LEVEL SECURITY;
ALTER TABLE "t_opportunities" FORCE ROW LEVEL SECURITY;
ALTER TABLE "t_opportunity_slots" FORCE ROW LEVEL SECURITY;
ALTER TABLE "t_reservations" FORCE ROW LEVEL SECURITY;
ALTER TABLE "t_participations" FORCE ROW LEVEL SECURITY;
ALTER TABLE "t_evaluations" FORCE ROW LEVEL SECURITY;
ALTER TABLE "t_transactions" FORCE ROW LEVEL SECURITY;
ALTER TABLE "t_ticket_issuers" FORCE ROW LEVEL SECURITY;
ALTER TABLE "t_ticket_claim_links" FORCE ROW LEVEL SECURITY;
ALTER TABLE "t_tickets" FORCE ROW LEVEL SECURITY;

-- Isolation Policy: filter by userId -> memberships -> communityId

CREATE POLICY community_isolation_policy ON "t_places"
  USING (
    "community_id" IN (
      SELECT "community_id" FROM "t_memberships"
      WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id'), '')::text
    )
  );

CREATE POLICY community_isolation_policy ON "t_utilities"
  USING (
    "community_id" IN (
      SELECT "community_id" FROM "t_memberships"
      WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id'), '')::text
    )
  );

CREATE POLICY community_isolation_policy ON "t_articles"
  USING (
    "community_id" IN (
      SELECT "community_id" FROM "t_memberships"
      WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id'), '')::text
    )
  );

CREATE POLICY community_isolation_policy ON "t_wallets"
  USING (
    "community_id" IN (
      SELECT "community_id" FROM "t_memberships"
      WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id'), '')::text
    )
  );

CREATE POLICY community_isolation_policy ON "t_opportunities"
  USING (
    "community_id" IN (
      SELECT "community_id" FROM "t_memberships"
      WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id'), '')::text
    )
  );

CREATE POLICY community_isolation_policy ON "t_opportunity_slots"
USING (
  "opportunity_id" IN (
    SELECT "id" FROM "t_opportunities"
    WHERE "community_id" IN (
      SELECT "community_id" FROM "t_memberships"
      WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id'), '')::text
    )
  )
);

CREATE POLICY community_isolation_policy ON "t_reservations"
USING (
  "opportunity_slot_id" IN (
    SELECT "id" FROM "t_opportunity_slots"
    WHERE "opportunity_id" IN (
      SELECT "id" FROM "t_opportunities"
      WHERE "community_id" IN (
        SELECT "community_id" FROM "t_memberships"
        WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id'), '')::text
      )
    )
  )
);

CREATE POLICY community_isolation_policy ON "t_participations"
  USING (
    "community_id" IN (
      SELECT "community_id" FROM "t_memberships"
      WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id'), '')::text
    )
  );

CREATE POLICY community_isolation_policy ON "t_evaluations"
  USING (
    "participation_id" IN (
      SELECT "id" FROM "t_participations"
      WHERE "community_id" IN (
        SELECT "community_id" FROM "t_memberships"
        WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id'), '')::text
      )
    )
  );

CREATE POLICY community_isolation_policy ON "t_transactions"
  USING (
    "from" IN (
      SELECT "id" FROM "t_wallets"
      WHERE "community_id" IN (
        SELECT "community_id" FROM "t_memberships"
        WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id'), '')::text
      )
    )
    OR
    "to" IN (
      SELECT "id" FROM "t_wallets"
      WHERE "community_id" IN (
        SELECT "community_id" FROM "t_memberships"
        WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id'), '')::text
      )
    )
  );

CREATE POLICY community_isolation_policy ON "t_ticket_issuers"
  USING (
    "utility_id" IN (
      SELECT "id" FROM "t_utilities"
      WHERE "community_id" IN (
        SELECT "community_id" FROM "t_memberships"
        WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id'), '')::text
      )
    )
  );

CREATE POLICY community_isolation_policy ON "t_ticket_claim_links"
  USING (
    "issuer_id" IN (
      SELECT "id" FROM "t_ticket_issuers"
      WHERE "utility_id" IN (
        SELECT "id" FROM "t_utilities"
        WHERE "community_id" IN (
          SELECT "community_id" FROM "t_memberships"
          WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id'), '')::text
        )
      )
    )
  );

CREATE POLICY community_isolation_policy ON "t_tickets"
  USING (
    "wallet_id" IN (
      SELECT "id" FROM "t_wallets"
      WHERE "community_id" IN (
        SELECT "community_id" FROM "t_memberships"
        WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id'), '')::text
      )
    )
    OR
    "utility_id" IN (
      SELECT "id" FROM "t_utilities"
      WHERE "community_id" IN (
        SELECT "community_id" FROM "t_memberships"
        WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id'), '')::text
      )
    )
  );

-- Bypass Policy
DO $$
DECLARE
tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    't_places', 't_utilities', 't_articles', 't_wallets', 't_opportunities',
          't_opportunity_slots','t_reservations',
    't_participations', 't_evaluations', 't_transactions',
    't_ticket_issuers', 't_ticket_claim_links', 't_tickets'
  ]
  LOOP
    EXECUTE format($f$
      CREATE POLICY community_bypass_policy ON %I
      USING (NULLIF(current_setting('app.rls_bypass'), 'off')::text = 'on');
    $f$, tbl);
END LOOP;
END $$;
