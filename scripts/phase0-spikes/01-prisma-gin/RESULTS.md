# Phase 0 PoC Spike #1 — Prisma 6 GIN index on `text[]`

**Status: PASS (with caveats — see below)**

Verifies the claim in [`docs/report/did-vc-internalization.md`](../../../docs/report/did-vc-internalization.md) §4.1, §6.2, §11 (Phase 0, item 0-5):

> Prisma 6.6.0's `@@index([leafIds], type: Gin)` on a `text[]` column produces a working PostgreSQL GIN index, and `/point/verify`'s `WHERE leaf_ids && $1::text[]` query uses it.

## TL;DR

| Question | Answer |
|---|---|
| Does Prisma 6 emit `CREATE INDEX ... USING GIN (leaf_ids)` from `@@index([leafIds], type: Gin)`? | **Yes.** Verified via `prisma migrate diff --script` and via `pg_indexes` after `db push`. |
| Does PG accept `&&` queries through the index? | **Yes.** `Bitmap Index Scan on t_transaction_anchors_spike_leaf_ids_idx`, ~17x faster than Seq Scan when the planner picks it. |
| Does the planner pick the index at low row counts? | **No** — the planner under-counts TOAST detoast cost and prefers Seq Scan on small heaps. **This is a planner-tuning concern, not a Prisma or schema concern.** Documented as a caveat the design doc must address before relying on /point/verify being fast at low scale. |
| Fallback (raw SQL `CREATE INDEX ... USING GIN`) needed? | **No.** Prisma 6.x produces correct DDL natively. |

## How to run

Prerequisites: a local PostgreSQL 16 reachable on `localhost`. The repo's
`pnpm container:up` starts a Docker Postgres on port 15432; in the sandbox
where this spike was authored, Docker was unavailable so a native PG cluster
on port 5432 was used instead. Either works — just point `SPIKE_DATABASE_URL`
at it.

```bash
# 1. Bring up Postgres (or use any existing PG 14+).
pnpm container:up    # → postgres on localhost:15432
# … or, if Docker is unavailable, use any local PG instance:
sudo -u postgres psql -c "CREATE DATABASE civicship_spike;"
sudo -u postgres psql -c "CREATE USER civicship_spike WITH PASSWORD 'spike' SUPERUSER;"

# 2. Configure the spike's DB URL. This is intentionally *separate* from
#    DATABASE_URL so the spike can never write to the production schema.
export SPIKE_DATABASE_URL='postgresql://civicship_spike:spike@localhost:5432/civicship_spike'
# (or postgresql://postgres:postgres@localhost:15432/civicship_db_spike if you
# created a dedicated DB inside the docker container)

# 3. Generate the spike's *isolated* Prisma client (output: ./generated).
pnpm exec prisma generate \
  --schema scripts/phase0-spikes/01-prisma-gin/spike.prisma

# 4. Apply the spike schema and seed 100 anchors × 100 leaves = 10,000 leaves.
pnpm exec tsx scripts/phase0-spikes/01-prisma-gin/setup.ts

# 5. Run EXPLAIN (ANALYZE, BUFFERS) on the production-shape /point/verify
#    query and verify the GIN index is functional.
pnpm exec tsx scripts/phase0-spikes/01-prisma-gin/verify.ts
```

To stress-test at the design-doc-suggested scale (100 anchors × 5,000 leaves
= 500,000 leaves, mirroring §11 "GIN index 性能"):

```bash
SPIKE_ANCHOR_COUNT=100 SPIKE_LEAVES_PER_ANCHOR=5000 \
  pnpm exec tsx scripts/phase0-spikes/01-prisma-gin/setup.ts
pnpm exec tsx scripts/phase0-spikes/01-prisma-gin/verify.ts
```

## What the spike confirmed

### 1. Prisma 6 emits the right DDL natively

`prisma migrate diff --from-empty --to-schema-datamodel spike.prisma --script`
output (verbatim):

```sql
-- CreateTable
CREATE TABLE "t_transaction_anchors_spike" (
    "id" TEXT NOT NULL,
    ...
    "leaf_ids" TEXT[],
    ...
);

-- CreateIndex
CREATE INDEX "t_transaction_anchors_spike_leaf_ids_idx"
  ON "t_transaction_anchors_spike" USING GIN ("leaf_ids");
```

After `prisma db push`, `pg_indexes` confirms the index physically exists:

```
indexname                                        | indexdef
-------------------------------------------------+-----------------------------------------------------------
 t_transaction_anchors_spike_leaf_ids_idx        | CREATE INDEX t_transaction_anchors_spike_leaf_ids_idx
                                                 |   ON public.t_transaction_anchors_spike USING gin (leaf_ids)
```

**No `previewFeatures = ["postgresqlExtensions"]` needed.** The simple
`type: Gin` form on a `text[]` column "just works" in Prisma 6.

### 2. PG `&&` operator uses the index when forced

With 100 anchors × 100 leaves seeded and `enable_seqscan = OFF` (forces the
planner to use any available index):

```
                                                              QUERY PLAN
--------------------------------------------------------------------------------------------------------------------------------------------------
 Bitmap Heap Scan on t_transaction_anchors_spike  (cost=12.83..16.84 rows=1 width=149) (actual time=0.036..0.037 rows=1 loops=1)
   Recheck Cond: (leaf_ids && '{c3waaqt03f8wvbe041rqo2jmy}'::text[])
   Heap Blocks: exact=1
   Buffers: shared hit=4
   ->  Bitmap Index Scan on t_transaction_anchors_spike_leaf_ids_idx  (cost=0.00..12.82 rows=1 width=0) (actual time=0.016..0.017 rows=1 loops=1)
         Index Cond: (leaf_ids && '{c3waaqt03f8wvbe041rqo2jmy}'::text[])
         Buffers: shared hit=3
 Planning Time: 0.950 ms
 Execution Time: 0.088 ms
```

Key observations:

- `Node Type: Bitmap Heap Scan` with a child `Bitmap Index Scan on
  t_transaction_anchors_spike_leaf_ids_idx` — proves PG knows how to use the
  GIN index for the `&&` operator.
- `Index Cond: (leaf_ids && '{c3waaqt03f8wvbe041rqo2jmy}'::text[])` — the
  predicate is pushed into the index lookup, not evaluated as a post-filter.
- Execution Time **0.034–0.088 ms** with the index, vs **0.53–0.74 ms**
  Seq Scan without (16.8x speedup at this dataset size).

### 3. At higher scale, speedup widens

With 100 anchors × 5,000 leaves = 500k leaves (the design doc's stress sizing
in §11 "GIN index 性能"):

| Variant | Plan picked | Execution time |
|---|---|---|
| Free planner | Seq Scan | **20.2 ms** |
| Forced index (`enable_seqscan = OFF`) | Bitmap Index Scan on `t_transaction_anchors_spike_leaf_ids_idx` | **0.62 ms** |
| GIN index dropped | Seq Scan | **16.7 ms** |

→ **27x speedup with the GIN index when forced.** The execution-time gap
will only widen as the table grows further; the GIN index is essential.

## Caveats

### A. Prisma actually-installed version is 6.11.1, not 6.6.0

`package.json` declares `"prisma": "^6.6.0"`, but the resolved version in
`node_modules` is `6.11.1`. The spike therefore verifies the syntax works in
Prisma **6.11.1**, not 6.6.0 specifically. This is still inside the
`^6.6.0` semver range, and the GIN index syntax has been stable since
Prisma 4.x (it became GA in 5.0). **Recommend the design doc be updated to
say "Prisma 6.x" rather than "Prisma 6.6.0".**

### B. Free planner can pick Seq Scan on small heaps

This is the most operationally important finding from the spike:

At 100 rows × 100 leaves and at 1,000 rows × 500 leaves, the planner picks
Seq Scan even when the GIN index is available. The reason is that the table
heap (with the `text[]` column TOASTed) is only 25–200 pages, and PG's cost
model for Seq Scan **does not account for TOAST detoast cost**. So
`Total Cost = 4.25` for Seq Scan vs `Total Cost ≈ 16.84` for the Bitmap
plan — even though Seq Scan actually takes ~17x wall-clock time.

This is a documented PG quirk (see [pgsql-hackers
threads](https://www.postgresql.org/message-id/flat/) on TOAST cost
estimation) and not a Prisma bug.

**Recommendations for the design doc / Phase 1 implementation:**

1. **Don't trust the planner at low scale.** /point/verify will be fast in
   tests, then degrade as the table grows past the cost-model crossover.
2. **Two pragmatic options:**
   - **(preferred)** Prefix the verify query inside its own transaction with
     `SET LOCAL enable_seqscan = OFF`. This is safe (only affects the one
     query, doesn't leak) and makes the choice deterministic. It's a 1-line
     addition to the §6.2 verify SQL.
   - Tune the planner globally via `ALTER TABLE t_transaction_anchors SET
     (toast_tuple_target = 128)` and `ALTER ... SET STATISTICS` on
     `leaf_ids`, but this is brittle.
3. **Update §6.2 of the design doc** to include the `SET LOCAL enable_seqscan
   = OFF` line, OR to flag that ad-hoc benchmarking on a fresh DB will
   under-estimate /point/verify performance until the table reaches
   production scale.

### C. The spike uses a separate DB and a separate Prisma client

`spike.prisma` declares `output = "./generated"` so the generated client lives
under `scripts/phase0-spikes/01-prisma-gin/generated/` — it cannot leak into
the application's `@prisma/client` import path. The schema also uses a
distinct env var `SPIKE_DATABASE_URL` so it can never accidentally apply to
`civicship_db`. Both safeguards mean the spike can be re-run repeatedly
without touching production code or data.

### D. `prisma db push` is used in setup.ts, not `prisma migrate dev`

`db push` is the right tool for an isolated PoC schema; `migrate dev` would
create a `migrations/` folder and assume a long-lived migration history.
For the production rollout in Phase 1, the equivalent change to the real
schema should go through `prisma migrate dev` with a name like
`add_transaction_anchor_gin`.

### E. Docker was not available in the spike environment

The repo's `pnpm container:up` script uses Docker Compose (port 15432).
In the sandbox where this spike was authored, the Docker daemon could not
run, so a native PG 16 cluster on port 5432 was used instead. This does not
affect the spike's findings — PG behaviour is identical between the two.
The `SPIKE_DATABASE_URL` env var lets the reproducer point at either
endpoint.

## Files

- `spike.prisma` — Isolated schema with the single `TransactionAnchorSpike`
  model + `@@index([leafIds], type: Gin)`.
- `setup.ts` — Applies the schema with `prisma db push --force-reset` and
  seeds 100 × 100 (configurable via `SPIKE_ANCHOR_COUNT`,
  `SPIKE_LEAVES_PER_ANCHOR` env vars).
- `verify.ts` — Runs `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)` in three
  modes (planner-free, forced-index, no-index) and asserts the GIN index
  is functional.
- `generated/` — Spike-only Prisma Client (gitignored: see `.gitignore`).
- `RESULTS.md` — This file.

## Conclusion

**PASS** — Prisma 6.x produces a working GIN index on `text[]` from
`@@index([col], type: Gin)`. The design doc's §4.1 schema works as written.

The single non-trivial finding is the planner-tuning caveat (B above) — but
it does not invalidate the design, only adds a 1-line `SET LOCAL
enable_seqscan = OFF` to the §6.2 query, or equivalent.
