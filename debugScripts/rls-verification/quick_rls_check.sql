
\echo '=== ENVIRONMENT RLS VERIFICATION ==='
\echo ''

\echo '1. Current RLS Settings:'
SELECT 
  'app.rls_bypass' as setting,
  current_setting('app.rls_bypass') as value
UNION ALL
SELECT 
  'app.rls_config.user_id' as setting,
  current_setting('app.rls_config.user_id') as value;

\echo ''
\echo '2. Table Row Counts:'
SELECT 
  't_transactions' as table_name,
  COUNT(*)::text as row_count
FROM t_transactions
UNION ALL
SELECT 
  'mv_current_points' as table_name,
  COUNT(*)::text as row_count
FROM mv_current_points;

\echo ''
\echo '3. RLS Bypass Test:'
SELECT set_config('app.rls_bypass', 'off', FALSE);
SELECT set_config('app.rls_config.user_id', '', FALSE);
SELECT 'WITHOUT_BYPASS' as test_type, COUNT(*) as transaction_count FROM t_transactions;

SELECT set_config('app.rls_bypass', 'on', FALSE);
SELECT set_config('app.rls_config.user_id', '', FALSE);
SELECT 'WITH_BYPASS' as test_type, COUNT(*) as transaction_count FROM t_transactions;

\echo ''
\echo '4. Materialized View Refresh Test:'
SELECT 'BEFORE_REFRESH' as stage, COUNT(*) as mv_count FROM mv_current_points;
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_current_points;
SELECT 'AFTER_REFRESH' as stage, COUNT(*) as mv_count FROM mv_current_points;

\echo ''
\echo '5. Environment Summary:'
SELECT 
  version() as postgresql_version,
  current_user as db_user,
  current_setting('app.rls_bypass') as rls_bypass,
  (SELECT COUNT(*) FROM t_transactions) as total_transactions,
  (SELECT COUNT(*) FROM mv_current_points) as mv_points_count;
