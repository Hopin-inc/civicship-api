/**
 * Phase 0 PoC Spike #1 — Setup
 *
 * Applies the spike Prisma schema (`spike.prisma`) to a local PostgreSQL
 * database and seeds 100 anchors × 100 leaf_ids = 10,000 cuid-like strings.
 *
 * Usage:
 *   export SPIKE_DATABASE_URL='postgresql://user:pass@host:5432/civicship_spike'
 *   pnpm exec tsx scripts/phase0-spikes/01-prisma-gin/setup.ts
 *
 * Idempotent: drops and recreates the spike table on each run so you can
 * iterate on the schema/index without manual cleanup.
 *
 * Why a separate database / generator output:
 *   The spike must not pollute the production Prisma client at
 *   `node_modules/@prisma/client`. We point `output` at `./generated` in
 *   `spike.prisma`, and the SPIKE_DATABASE_URL env var lets us isolate the
 *   schema completely from the main `civicship_db`.
 */

import { execSync } from "node:child_process";
import * as crypto from "node:crypto";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient, ChainNetwork, AnchorStatus } from "./generated";

// ESM-friendly __dirname.
const HERE = path.dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATH = path.join(HERE, "spike.prisma");

// Defaults match the spike spec (100 × 100 = 10k leaves). Override with env
// vars to reproduce the design doc's stress sizing (100 × 5000 = 500k leaves,
// see §11 "GIN index 性能" — `t_transaction_anchors.leaf_ids` に 100 行 × 各
// 5,000 件 leaf を入れて && 検索のレイテンシ実測").
const ANCHOR_COUNT = parseInt(process.env.SPIKE_ANCHOR_COUNT ?? "100", 10);
const LEAVES_PER_ANCHOR = parseInt(process.env.SPIKE_LEAVES_PER_ANCHOR ?? "100", 10);

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env var: ${name}`);
  }
  return value;
}

/**
 * Generate a cuid-like 25-char string. The real production code uses
 * `@paralleldrive/cuid2` (or the original cuid), but for the GIN index
 * spike all we need is realistic-length random strings — the index
 * operator class on `text[]` is `array_ops`, which doesn't care about
 * the string format, just that they are bytes.
 *
 * Uses `crypto.randomBytes` (not `Math.random`) because SonarCloud flags
 * the latter as a security hotspot even in non-security contexts. The
 * randomness quality doesn't matter for this spike, but using the secure
 * generator is free and silences the noise.
 */
function fakeCuid(seed: number): string {
  // 24 chars of base36 randomness + 1-char prefix; matches cuid length 25.
  // crypto.randomBytes(16) → 32 hex chars; convert each byte to base36 to
  // get base36 chars, take 24.
  const bytes = crypto.randomBytes(16);
  let rand = "";
  for (const b of bytes) {
    rand += b.toString(36);
  }
  return `c${(seed.toString(36) + rand).slice(0, 24)}`;
}

async function main() {
  const databaseUrl = requireEnv("SPIKE_DATABASE_URL");
  console.log(`[setup] target database: ${databaseUrl.replace(/:[^:@]+@/, ":****@")}`);

  // Reset the spike table by re-applying the schema with `db push --force-reset`.
  // We use a separate database (civicship_spike), so this is safe.
  console.log("[setup] resetting spike database with `prisma db push --force-reset`...");
  execSync(
    `pnpm exec prisma db push --schema "${SCHEMA_PATH}" --force-reset --skip-generate --accept-data-loss`,
    {
      stdio: "inherit",
      env: { ...process.env, SPIKE_DATABASE_URL: databaseUrl },
    },
  );

  const prisma = new PrismaClient();

  try {
    // Generate 100 anchors × 100 leaf_ids each = 10,000 cuid-like strings.
    console.log(
      `[setup] seeding ${ANCHOR_COUNT} anchors × ${LEAVES_PER_ANCHOR} leaves = ${
        ANCHOR_COUNT * LEAVES_PER_ANCHOR
      } leaves total`,
    );

    // Pre-generate all leaf ids so we can deterministically sample one
    // for the verification script and persist it.
    const allAnchorRows: Array<{
      id: string;
      leafIds: string[];
    }> = [];

    let counter = 0;
    const batchSize = 10;
    for (let batchStart = 0; batchStart < ANCHOR_COUNT; batchStart += batchSize) {
      const batch: Array<{
        periodStart: Date;
        periodEnd: Date;
        rootHash: string;
        leafIds: string[];
        leafCount: number;
        network: ChainNetwork;
        status: AnchorStatus;
      }> = [];

      for (let i = batchStart; i < Math.min(batchStart + batchSize, ANCHOR_COUNT); i++) {
        const leafIds: string[] = [];
        for (let j = 0; j < LEAVES_PER_ANCHOR; j++) {
          leafIds.push(fakeCuid(counter++));
        }
        // Production code orders cuid ASC for canonical Merkle leaves; mimic.
        leafIds.sort();

        batch.push({
          periodStart: new Date(2026, 0, 1 + i),
          periodEnd: new Date(2026, 0, 8 + i),
          rootHash: "deadbeef".repeat(8),
          leafIds,
          leafCount: leafIds.length,
          network: ChainNetwork.CARDANO_PREPROD,
          status: AnchorStatus.CONFIRMED,
        });

        // Track for later sampling. We don't need the DB-generated id for
        // the verify step (we query by leaf id, not by anchor id).
        allAnchorRows.push({ id: "", leafIds });
      }

      await prisma.transactionAnchorSpike.createMany({ data: batch });

      const done = Math.min(batchStart + batchSize, ANCHOR_COUNT);
      if (done % 25 === 0 || done === ANCHOR_COUNT) {
        console.log(`[setup]   inserted ${done}/${ANCHOR_COUNT} anchors`);
      }
    }

    // Persist a known leaf id so verify.ts can target an existing row deterministically.
    // Pick the middle anchor's middle leaf — anything that is guaranteed to be present.
    const sampleAnchor = allAnchorRows[Math.floor(ANCHOR_COUNT / 2)];
    const sampleLeafId = sampleAnchor.leafIds[Math.floor(LEAVES_PER_ANCHOR / 2)];

    // ANALYZE so the planner has stats. Without this, on small tables the
    // planner may choose Seq Scan even with a working GIN index — that's a
    // planner choice, not an "index doesn't work" signal.
    console.log("[setup] running ANALYZE on the spike table...");
    await prisma.$executeRawUnsafe(`ANALYZE "t_transaction_anchors_spike"`);

    // Verify the index actually exists at the SQL level.
    const indexes: Array<{ indexname: string; indexdef: string }> =
      await prisma.$queryRawUnsafe(
        `SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 't_transaction_anchors_spike' ORDER BY indexname`,
      );
    console.log("[setup] indexes on t_transaction_anchors_spike:");
    for (const idx of indexes) {
      console.log(`  - ${idx.indexname}: ${idx.indexdef}`);
    }

    const ginIndex = indexes.find((i) => /USING gin/i.test(i.indexdef) && /leaf_ids/.test(i.indexdef));
    if (!ginIndex) {
      throw new Error(
        "GIN index on leaf_ids was NOT created — Prisma 6 did not honour `@@index([leafIds], type: Gin)`",
      );
    }
    console.log(`[setup] OK: GIN index found (${ginIndex.indexname})`);

    console.log("[setup] writing sample leaf id for verify.ts...");
    // Stash the sample leaf id in a side-table so verify.ts doesn't need to
    // re-seed; this also exercises an INSERT path in the same database.
    // Use $executeRaw template literal (parameterized) instead of manual
    // escaping with $executeRawUnsafe (Gemini review + SonarCloud hotspot).
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS spike_sample (key text PRIMARY KEY, value text NOT NULL)`;
    await prisma.$executeRaw`DELETE FROM spike_sample`;
    await prisma.$executeRaw`INSERT INTO spike_sample (key, value) VALUES ('sample_leaf_id', ${sampleLeafId})`;

    console.log(`[setup] DONE`);
    console.log(`[setup]   sample leaf id  : ${sampleLeafId}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("[setup] FAILED:", err);
  process.exit(1);
});
