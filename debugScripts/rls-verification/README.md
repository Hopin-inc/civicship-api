# RLS Verification Scripts

This directory contains scripts to verify Row Level Security (RLS) bypass configuration differences between develop and master environments.

## Problem Context

The `currentPointView` is null for all communities on master branch but works correctly on develop branch. Both environments use identical code, suggesting a database-level RLS configuration difference.

## Scripts Overview

### 1. `quick_rls_check.sql`
**Quick verification script for immediate comparison**
```bash
# Run in both develop and master environments
psql $DATABASE_URL -f debugScripts/rls-verification/quick_rls_check.sql
```

### 2. `rls_verification_script.sql` 
**Comprehensive RLS verification with detailed testing**
```bash
# Full diagnostic script
psql $DATABASE_URL -f debugScripts/rls-verification/rls_verification_script.sql
```

### 3. `verify_rls_commands.sh`
**Terminal command reference with copy-paste ready commands**
```bash
# View all available commands
cat debugScripts/rls-verification/verify_rls_commands.sh
```

### 4. `prisma_debug_verification.ts`
**TypeScript verification for PrismaClientIssuer behavior**
```bash
# Run in Node.js environment
cd /path/to/civicship-api
npx ts-node debugScripts/rls-verification/prisma_debug_verification.ts
```

## Quick Comparison Commands

### One-liner Environment Comparison
```bash
# Copy-paste friendly command for quick comparison
psql $DATABASE_URL -t -c "SELECT 'BYPASS:' || current_setting('app.rls_bypass') || ' | TRANSACTIONS:' || COUNT(*)::text || ' | MV_POINTS:' || (SELECT COUNT(*)::text FROM mv_current_points) FROM t_transactions;"
```

### Basic RLS Status Check
```bash
psql $DATABASE_URL -c "
SELECT 'RLS Bypass Setting:' as test, current_setting('app.rls_bypass') as value
UNION ALL
SELECT 'RLS Config User ID:' as test, current_setting('app.rls_config.user_id') as value
UNION ALL 
SELECT 'Transaction Count:' as test, COUNT(*)::text as value FROM t_transactions
UNION ALL
SELECT 'MV Current Points Count:' as test, COUNT(*)::text as value FROM mv_current_points;
"
```

## Expected Results

### Develop Environment (Working)
- `app.rls_bypass`: 'on' during materialized view refresh
- Transaction count: > 0 with bypass enabled
- MV current points: > 0 after refresh

### Master Environment (Broken)
- `app.rls_bypass`: 'off' or configuration error
- Transaction count: 0 with bypass disabled
- MV current points: 0 (all null currentPointView)

## Root Cause Hypothesis

The `app.rls_bypass` PostgreSQL session setting is not properly initialized in the master environment, causing materialized view refresh to fail due to RLS constraints on `t_transactions` table.

## Technical Details

- **RLS Bypass Policy**: `NULLIF(current_setting('app.rls_bypass'), 'off')::text = 'on'`
- **Community Isolation**: Filters by `app.rls_config.user_id` from `t_memberships`
- **Materialized View**: `mv_current_points` queries RLS-protected `t_transactions`
- **PrismaClientIssuer**: Uses `set_config('app.rls_bypass', 'on', FALSE)` for bypass
