# Database Migration Operations Guide

This document describes the operational playbook for safely landing Prisma
schema migrations in civicship-api, with particular focus on **destructive
DDL** that can corrupt data, drop tables/columns still in use, or block
readers/writers under load.

## Why This Matters

Cloud Run runs **multiple revisions concurrently** during a deploy: the new
revision starts taking traffic before the old revision finishes draining. If
a migration removes a column that the still-live old revision is reading,
those requests will fail with a `column "x" does not exist` error mid-flight.
Similarly, an `ALTER COLUMN ... TYPE` rewrites the entire table while
holding `ACCESS EXCLUSIVE`, blocking every reader and writer until done.

The CI workflow runs `pnpm db:migrate-diff` on every PR. It scans newly
added or modified migration `.sql` files for destructive patterns and
surfaces them as `::warning::` annotations in the PR check summary. The
check is **non-blocking by design** — reviewers decide whether the
migration is safe to land. Use this guide to make that decision.

## Destructive DDL Patterns Detected by CI

| Pattern | Why it's dangerous |
| --- | --- |
| `DROP TABLE` | Permanent data loss; breaks any code still referencing the table. |
| `DROP COLUMN` | Permanent data loss; breaks live readers/writers on the old revision. |
| `ALTER TABLE ... DROP ...` | Same as above (constraint / column / index drops). |
| `ALTER COLUMN ... TYPE ...` | Full table rewrite under `ACCESS EXCLUSIVE`; can block production for minutes on large tables; cast may fail mid-rewrite. |
| `RENAME TABLE / COLUMN / TO` | Old revision continues to read the old name during deploy → 100% error rate on that path until rollout completes. |
| `DROP VIEW` / `DROP MATERIALIZED VIEW` | Breaks consumers; also affects materialized point views (`mv_current_points`, `mv_accumulated_points`). |
| `DROP INDEX` (without `CONCURRENTLY`) | Holds `ACCESS EXCLUSIVE` on the table for the duration of the drop; blocks reads and writes. |
| `TRUNCATE` | Permanent data loss. |

If CI flags any of these, **do not merge the PR until you have either**:

1. Restructured the change as a multi-step (expand → migrate → contract)
   migration, or
2. Reviewed and explicitly accepted the risk in the PR description, with an
   approving review from a maintainer aware of the operational impact.

## Safe-Migration Playbook

### Pattern 1: Two-Step Migration (Expand / Contract)

Use this for any column rename, type change, or column drop where the column
is currently read or written by application code.

**Step 1 — Expand (PR #1):**
- Add the new column / table / shape alongside the old one. **Do not drop
  the old one yet.**
- Update application code to **dual-write** to both old and new.
- Optionally: backfill historical rows from old → new (see Pattern 2).
- Deploy. Both revisions are now stable: old revision reads/writes old, new
  revision reads/writes both.

**Step 2 — Migrate readers (PR #2):**
- Switch all reads to the new column.
- Stop writing to the old column.
- Deploy. Verify in production that the old column is no longer read.

**Step 3 — Contract (PR #3):**
- Drop the old column / table.
- Deploy. By construction no live code references the old shape, so the
  destructive DDL is safe.

**Why three PRs?** Each deploy must complete (old revision fully drained)
before the next destructive change goes out. Combining steps risks
overlapping the drop with the still-live old revision.

### Pattern 2: Backfill via Migration Script

When you need to populate a new column from existing data:

- Add the new column as nullable in the migration.
- Run the backfill in a **separate** migration (or as application code) in
  bounded batches (e.g. `UPDATE ... WHERE id IN (SELECT id FROM ... LIMIT
  1000)` in a loop).
- Once backfill is verified complete, add a `NOT NULL` constraint in a
  follow-up migration.

Avoid `UPDATE table SET col = ...` without `LIMIT` or batching on large
tables — it holds row locks for the entire table and can saturate WAL.

### Pattern 3: View-Based Replacement

When changing the shape of data exposed to read paths (e.g. splitting a
table, renaming derived columns):

- Create a database `VIEW` that exposes the **old** shape on top of the
  **new** underlying tables.
- Point the application at the view (transparent to readers).
- Migrate the underlying schema freely.
- Once readers are migrated to the new shape directly, drop the view.

This is the same idea as Pattern 1 but at the storage layer instead of the
column layer.

### Pattern 4: `DROP INDEX CONCURRENTLY` for Index Removal

Plain `DROP INDEX` takes `ACCESS EXCLUSIVE` on the table — every read and
write blocks until the drop completes. On large tables this can be
seconds-to-minutes of full unavailability.

`DROP INDEX CONCURRENTLY` waits for in-flight transactions and only locks
briefly:

```sql
DROP INDEX CONCURRENTLY IF EXISTS idx_old_thing;
```

Caveats:
- Cannot run inside a transaction. Prisma migrations wrap each `.sql` file
  in a transaction by default; you must split the `DROP INDEX
  CONCURRENTLY` into its own migration **and** add the `-- prisma+deploy`
  marker (or split the file) so it runs outside a transaction. See the
  Prisma docs for the current escape hatch.

The same applies to `CREATE INDEX CONCURRENTLY` for adding indexes on
large tables.

## Local Workflow Reminder

The same script (`scripts/prisma/migrate-diff.sh`, exposed as
`pnpm db:migrate-diff`) has two modes:

- **Developer mode** — `pnpm db:migrate-diff <name>`: scaffolds a new
  `migrations/<timestamp>_<name>/migration.sql` from the current
  `schema.prisma`. Used locally when authoring a migration.
- **CI scan mode** — `pnpm db:migrate-diff` (no args): scans `.sql`
  migrations added vs `origin/develop` (or `MIGRATE_DIFF_BASE_REF`) for
  destructive DDL and emits GitHub Actions `::warning::` annotations.
  Always exits 0 — informational only.

Running `pnpm db:migrate-diff` locally before pushing surfaces the same
warnings you'll see on the PR.

## Reviewer Checklist

When reviewing a PR with `::warning::` destructive-migration annotations:

- [ ] Is this a multi-step migration where the destructive step is the
      *contract* phase, with the *expand* phase already deployed and the
      old shape verified unused?
- [ ] If `ALTER COLUMN ... TYPE`: how large is the table? Will the rewrite
      fit within an acceptable maintenance window?
- [ ] If `DROP INDEX`: can it be `DROP INDEX CONCURRENTLY` instead?
- [ ] If `RENAME`: is there application code reading the old name in the
      currently-deployed revision?
- [ ] Is there a rollback plan that doesn't require restoring from backup?

If any answer is "no" or "unknown", request changes and link this document.
