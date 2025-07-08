#!/bin/bash

echo "=== RLS Bypass Verification Commands ==="
echo "Run these commands in both develop and master environments"
echo ""

echo "1. DATABASE CONNECTION TEST:"
echo "# Connect to database and run basic RLS check"
echo 'psql $DATABASE_URL -c "SELECT current_setting('"'"'app.rls_bypass'"'"') as rls_bypass_setting;"'
echo ""

echo "2. COMPREHENSIVE RLS VERIFICATION:"
echo "# Run the full verification script"
echo 'psql $DATABASE_URL -f /path/to/rls_verification_script.sql'
echo ""

echo "3. QUICK RLS STATUS CHECK:"
echo 'psql $DATABASE_URL -c "'
echo "SELECT '"'"'RLS Bypass Setting:'"'"' as test, current_setting('"'"'app.rls_bypass'"'"') as value"
echo "UNION ALL"
echo "SELECT '"'"'RLS Config User ID:'"'"' as test, current_setting('"'"'app.rls_config.user_id'"'"') as value"
echo "UNION ALL" 
echo "SELECT '"'"'Transaction Count:'"'"' as test, COUNT(*)::text as value FROM t_transactions"
echo "UNION ALL"
echo "SELECT '"'"'MV Current Points Count:'"'"' as test, COUNT(*)::text as value FROM mv_current_points;"
echo '"'
echo ""

echo "4. TEST RLS BYPASS FUNCTIONALITY:"
echo 'psql $DATABASE_URL -c "'
echo "-- Test without bypass (should be limited)"
echo "SELECT set_config('"'"'app.rls_bypass'"'"', '"'"'off'"'"', FALSE);"
echo "SELECT set_config('"'"'app.rls_config.user_id'"'"', '"'"''"'"', FALSE);"
echo "SELECT '"'"'Without bypass:'"'"' as test, COUNT(*) as count FROM t_transactions;"
echo ""
echo "-- Test with bypass (should see all)"
echo "SELECT set_config('"'"'app.rls_bypass'"'"', '"'"'on'"'"', FALSE);"
echo "SELECT '"'"'With bypass:'"'"' as test, COUNT(*) as count FROM t_transactions;"
echo '"'
echo ""

echo "5. MATERIALIZED VIEW REFRESH TEST:"
echo 'psql $DATABASE_URL -c "'
echo "SELECT set_config('"'"'app.rls_bypass'"'"', '"'"'on'"'"', FALSE);"
echo "SELECT '"'"'Before refresh:'"'"' as test, COUNT(*) as count FROM mv_current_points;"
echo "REFRESH MATERIALIZED VIEW CONCURRENTLY mv_current_points;"
echo "SELECT '"'"'After refresh:'"'"' as test, COUNT(*) as count FROM mv_current_points;"
echo '"'
echo ""

echo "6. APPLICATION-LEVEL VERIFICATION:"
echo "# Run TypeScript verification (requires Node.js environment)"
echo "cd /path/to/civicship-api"
echo "npx ts-node prisma_debug_verification.ts"
echo ""

echo "7. PRISMA CLIENT DIRECT TEST:"
echo "# Test Prisma client RLS behavior"
echo 'node -e "'
echo "const { PrismaClient } = require('@prisma/client');"
echo "const client = new PrismaClient();"
echo "client.\$transaction(async (tx) => {"
echo "  const bypass = await tx.\$queryRawUnsafe('SELECT set_config(\\'app.rls_bypass\\', \\'on\\', FALSE) as value');"
echo "  const count = await tx.\$queryRawUnsafe('SELECT COUNT(*) as count FROM t_transactions');"
echo "  console.log('Bypass result:', bypass[0]);"
echo "  console.log('Transaction count:', count[0]);"
echo "}).finally(() => client.\$disconnect());"
echo '"'
echo ""

echo "8. ENVIRONMENT COMPARISON:"
echo "# Run this in both environments and compare outputs"
echo 'psql $DATABASE_URL -c "'
echo "SELECT '"'"'Environment Info'"'"' as category, '"'"'PostgreSQL Version'"'"' as test, version() as value"
echo "UNION ALL"
echo "SELECT '"'"'Environment Info'"'"', '"'"'Current User'"'"', current_user"
echo "UNION ALL"
echo "SELECT '"'"'Environment Info'"'"', '"'"'Session User'"'"', session_user"
echo "UNION ALL"
echo "SELECT '"'"'RLS Settings'"'"', '"'"'app.rls_bypass'"'"', current_setting('"'"'app.rls_bypass'"'"')"
echo "UNION ALL"
echo "SELECT '"'"'RLS Settings'"'"', '"'"'app.rls_config.user_id'"'"', current_setting('"'"'app.rls_config.user_id'"'"')"
echo "UNION ALL"
echo "SELECT '"'"'Table Counts'"'"', '"'"'t_transactions'"'"', COUNT(*)::text FROM t_transactions"
echo "UNION ALL"
echo "SELECT '"'"'Table Counts'"'"', '"'"'mv_current_points'"'"', COUNT(*)::text FROM mv_current_points;"
echo '"'
echo ""

echo "9. RLS POLICY INSPECTION:"
echo 'psql $DATABASE_URL -c "'
echo "SELECT schemaname, tablename, policyname, permissive, cmd, qual"
echo "FROM pg_policies" 
echo "WHERE tablename IN ('"'"'t_transactions'"'"', '"'"'t_wallets'"'"')"
echo "ORDER BY tablename, policyname;"
echo '"'
echo ""

echo "10. ONE-LINER ENVIRONMENT COMPARISON:"
echo "# Copy-paste friendly command for quick comparison"
echo 'psql $DATABASE_URL -t -c "SELECT '"'"'BYPASS:'"'"' || current_setting('"'"'app.rls_bypass'"'"') || '"'"' | TRANSACTIONS:'"'"' || COUNT(*)::text || '"'"' | MV_POINTS:'"'"' || (SELECT COUNT(*)::text FROM mv_current_points) FROM t_transactions;"'
