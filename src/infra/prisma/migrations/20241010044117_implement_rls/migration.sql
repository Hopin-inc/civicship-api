-- Enable Row Level Security
ALTER TABLE "t_users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "t_groups" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "t_activities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "t_events_on_organizations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "t_issues_on_organizations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "t_targets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "t_agendas_on_organizations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "t_cities_on_organizations" ENABLE ROW LEVEL SECURITY;

-- Force Row Level Security for table owners
ALTER TABLE "t_users" FORCE ROW LEVEL SECURITY;
ALTER TABLE "t_groups" FORCE ROW LEVEL SECURITY;
ALTER TABLE "t_activities" FORCE ROW LEVEL SECURITY;
ALTER TABLE "t_events_on_organizations" FORCE ROW LEVEL SECURITY;
ALTER TABLE "t_issues_on_organizations" FORCE ROW LEVEL SECURITY;
ALTER TABLE "t_targets" FORCE ROW LEVEL SECURITY;
ALTER TABLE "t_agendas_on_organizations" FORCE ROW LEVEL SECURITY;
ALTER TABLE "t_cities_on_organizations" FORCE ROW LEVEL SECURITY;

-- Create row security policies
CREATE POLICY organization_isolation_policy ON "t_users" USING ("id" = ANY(
    SELECT "o1"."user_id" FROM "t_users_on_organizations" "o1"
    WHERE "o1"."organization_id" IN (
        SELECT "o2"."organization_id" FROM "t_users_on_organizations" "o2"
        WHERE "o2"."user_id" = NULLIF(current_setting('app.rls_config.user_id'), '')::text
    )
));
CREATE POLICY organization_isolation_policy ON "t_groups" USING ("organization_id" = ANY(
    SELECT "o"."organization_id" FROM "t_users_on_organizations" "o"
    WHERE "o"."user_id" = NULLIF(current_setting('app.rls_config.user_id'), '')::text
));
CREATE POLICY organization_isolation_policy ON "t_activities" USING ("organization_id" = ANY(
    SELECT "o"."organization_id" FROM "t_users_on_organizations" "o"
    WHERE "o"."user_id" = NULLIF(current_setting('app.rls_config.user_id'), '')::text
));
CREATE POLICY organization_isolation_policy ON "t_events_on_organizations" USING ("organization_id" = ANY(
    SELECT "o"."organization_id" FROM "t_users_on_organizations" "o"
    WHERE "o"."user_id" = NULLIF(current_setting('app.rls_config.user_id'), '')::text
));
CREATE POLICY organization_isolation_policy ON "t_issues_on_organizations" USING ("organization_id" = ANY(
    SELECT "o"."organization_id" FROM "t_users_on_organizations" "o"
    WHERE "o"."user_id" = NULLIF(current_setting('app.rls_config.user_id'), '')::text
));
CREATE POLICY organization_isolation_policy ON "t_targets" USING ("organization_id" = ANY(
    SELECT "o"."organization_id" FROM "t_users_on_organizations" "o"
    WHERE "o"."user_id" = NULLIF(current_setting('app.rls_config.user_id'), '')::text
));
CREATE POLICY organization_isolation_policy ON "t_agendas_on_organizations" USING ("organization_id" = ANY(
    SELECT "o"."organization_id" FROM "t_users_on_organizations" "o"
    WHERE "o"."user_id" = NULLIF(current_setting('app.rls_config.user_id'), '')::text
));
CREATE POLICY organization_isolation_policy ON "t_cities_on_organizations" USING ("organization_id" = ANY(
    SELECT "o"."organization_id" FROM "t_users_on_organizations" "o"
    WHERE "o"."user_id" = NULLIF(current_setting('app.rls_config.user_id'), '')::text
));

-- Create row security policies
CREATE POLICY organization_bypass_policy ON "t_users" USING (NULLIF(current_setting('app.rls_bypass'), 'off')::text = 'on');
CREATE POLICY organization_bypass_policy ON "t_groups" USING (NULLIF(current_setting('app.rls_bypass'), 'off')::text = 'on');
CREATE POLICY organization_bypass_policy ON "t_activities" USING (NULLIF(current_setting('app.rls_bypass'), 'off')::text = 'on');
CREATE POLICY organization_bypass_policy ON "t_events_on_organizations" USING (NULLIF(current_setting('app.rls_bypass'), 'off')::text = 'on');
CREATE POLICY organization_bypass_policy ON "t_issues_on_organizations" USING (NULLIF(current_setting('app.rls_bypass'), 'off')::text = 'on');
CREATE POLICY organization_bypass_policy ON "t_targets" USING (NULLIF(current_setting('app.rls_bypass'), 'off')::text = 'on');
CREATE POLICY organization_bypass_policy ON "t_agendas_on_organizations" USING (NULLIF(current_setting('app.rls_bypass'), 'off')::text = 'on');
CREATE POLICY organization_bypass_policy ON "t_cities_on_organizations" USING (NULLIF(current_setting('app.rls_bypass'), 'off')::text = 'on');
