
SELECT 'Current RLS bypass setting:' as test, current_setting('app.rls_bypass') as value;

SELECT 'Setting RLS bypass to ON:' as test, set_config('app.rls_bypass', 'on', FALSE) as value;
SELECT 'Verify RLS bypass is ON:' as test, current_setting('app.rls_bypass') as value;

SELECT 'Current RLS config user_id:' as test, current_setting('app.rls_config.user_id') as value;

SELECT 'Test bypass policy on t_transactions:' as test, COUNT(*) as transaction_count 
FROM "t_transactions" 
WHERE NULLIF(current_setting('app.rls_bypass'), 'off')::text = 'on';

SELECT 'Materialized view row count:' as test, COUNT(*) as mv_row_count 
FROM "mv_current_points";

SELECT set_config('app.rls_bypass', 'on', FALSE);
REFRESH MATERIALIZED VIEW CONCURRENTLY "mv_current_points";
SELECT 'Post-refresh MV row count:' as test, COUNT(*) as mv_row_count 
FROM "mv_current_points";

SELECT 'RLS enabled on t_transactions:' as test, relrowsecurity as value 
FROM pg_class WHERE relname = 't_transactions';

SELECT 'RLS enabled on t_wallets:' as test, relrowsecurity as value 
FROM pg_class WHERE relname = 't_wallets';

SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('t_transactions', 't_wallets')
ORDER BY tablename, policyname;

SELECT set_config('app.rls_bypass', 'off', FALSE);
SELECT set_config('app.rls_config.user_id', '', FALSE);
SELECT 'Transactions visible without bypass:' as test, COUNT(*) as count FROM "t_transactions";

SELECT set_config('app.rls_bypass', 'on', FALSE);
SELECT set_config('app.rls_config.user_id', '', FALSE);
SELECT 'Transactions visible with bypass:' as test, COUNT(*) as count FROM "t_transactions";

SELECT 'PostgreSQL version:' as test, version() as value;
SELECT 'Session user:' as test, session_user as value;
SELECT 'Current user:' as test, current_user as value;
