#!/usr/bin/env -S node --experimental-strip-types
/**
 * Weekly Cardano preprod canary for the anchor batch pipeline.
 *
 * This script proves that all *external* dependencies the weekly anchor batch
 * relies on are healthy, **without** actually submitting a transaction to
 * the chain. It is intentionally standalone (no DI container, no Prisma,
 * no app config) so it can run in a minimal CI job and fail loudly on any
 * single broken external before the real Sunday batch tries to submit.
 *
 * What it checks (in order, fail-fast):
 *   1. Blockfrost preprod reachability + API key validity
 *      → `health()` returns `is_healthy === true`
 *      → `BLOCKFROST_PROJECT_ID` exists and is a `preprod*` key
 *   2. Latest preprod block freshness
 *      → block within last 30 minutes (preprod block time ~20s, so >30 min
 *        means either the network is wedged or our key lost access)
 *   3. Blockfrost protocol params fetch (`epochsLatestParameters`)
 *      → required input for `txBuilder.buildAnchorTx` (§5.1.5)
 *   4. Metadata 1985 construction with sample roots + DID ops (§5.1.6)
 *      → builds an `AuxiliaryData` exactly like the real batch does
 *      → confirms the CSL serializer accepts our 64-byte chunking + UTF-8
 *        boundary handling (§5.1.6 / §5.1.7)
 *      → confirms metadata stays well under the 16 KB ceiling
 *
 * What this script intentionally does NOT do:
 *   - Submit a tx (no platform wallet UTXOs, no signing key in CI)
 *   - Touch our DB (Prisma not loaded → no schema drift coupling)
 *   - Talk to KMS (KMS health is covered by ci.yml integration tests)
 *
 * Required env:
 *   BLOCKFROST_PROJECT_ID   Blockfrost preprod API key (Secret Manager
 *                           `BLOCKFROST_PROJECT_ID_PREPROD` in production;
 *                           in CI passed via secrets.BLOCKFROST_PROJECT_ID)
 *
 * Optional env:
 *   CANARY_BLOCK_FRESHNESS_SECONDS   Override block freshness threshold
 *                                    (default 1800 = 30 min)
 *
 * Exit codes: 0 = PASS, 1 = FAIL.
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §15.4  (this canary)
 *   docs/report/did-vc-internalization.md §5.1.5 (Blockfrost client)
 *   docs/report/did-vc-internalization.md §5.1.6 (metadata 1985 schema)
 */

import { BlockFrostAPI } from "@blockfrost/blockfrost-js";
import { blake2b } from "@noble/hashes/blake2b";
import {
  buildAuxiliaryData,
  MAX_METADATA_TX_BYTES,
  type DidOp,
} from "../src/infrastructure/libs/cardano/txBuilder.ts";

// ---------------------------------------------------------------------------
// Tiny step runner — no external deps, just a "PASS / FAIL" log line per step
// so the GitHub Actions log surfaces precisely which dependency broke.
// ---------------------------------------------------------------------------

type StepResult = { name: string; ok: boolean; detail: string };

async function runStep(
  name: string,
  fn: () => Promise<string>,
): Promise<StepResult> {
  process.stdout.write(`-> ${name} ...\n`);
  try {
    const detail = await fn();
    process.stdout.write(`   PASS: ${detail}\n`);
    return { name, ok: true, detail };
  } catch (e) {
    const msg = (e as Error).message ?? String(e);
    process.stdout.write(`   FAIL: ${msg}\n`);
    return { name, ok: false, detail: msg };
  }
}

// ---------------------------------------------------------------------------
// Step 1 — env validation
// ---------------------------------------------------------------------------

function requirePreprodProjectId(): string {
  const projectId = process.env.BLOCKFROST_PROJECT_ID;
  if (!projectId) {
    throw new Error(
      "BLOCKFROST_PROJECT_ID is unset. Configure GitHub Actions secret " +
        "`BLOCKFROST_PROJECT_ID` (preprod key, prefix `preprod...`).",
    );
  }
  if (!projectId.startsWith("preprod")) {
    throw new Error(
      "BLOCKFROST_PROJECT_ID does not look like a preprod key " +
        `(expected prefix "preprod", got "${projectId.slice(0, 8)}..."). ` +
        "The canary must run against preprod, never mainnet.",
    );
  }
  return projectId;
}

// ---------------------------------------------------------------------------
// Step 2 — Blockfrost health + freshness
// ---------------------------------------------------------------------------

async function checkBlockfrostHealth(api: BlockFrostAPI): Promise<string> {
  const health = await api.health();
  if (!health.is_healthy) {
    throw new Error(
      `Blockfrost preprod reports is_healthy=false: ${JSON.stringify(health)}`,
    );
  }
  return "Blockfrost preprod is_healthy=true";
}

async function checkPreprodBlockFreshness(
  api: BlockFrostAPI,
  thresholdSeconds: number,
): Promise<string> {
  const latest = await api.blocksLatest();
  const time = latest.time; // unix seconds
  if (typeof time !== "number") {
    throw new Error(
      `blocksLatest returned no usable time field: ${JSON.stringify(latest)}`,
    );
  }
  const ageSeconds = Math.floor(Date.now() / 1000) - time;
  if (ageSeconds > thresholdSeconds) {
    throw new Error(
      `latest preprod block is ${ageSeconds}s old (> ${thresholdSeconds}s threshold). ` +
        "Either the preprod network is wedged or our Blockfrost key is rate-limited / wrong.",
    );
  }
  return `latest preprod block #${latest.height} is ${ageSeconds}s old (slot=${latest.slot})`;
}

// ---------------------------------------------------------------------------
// Step 3 — protocol params
// ---------------------------------------------------------------------------

async function checkProtocolParams(api: BlockFrostAPI): Promise<string> {
  const params = await api.epochsLatestParameters();
  // Spot-check the fields the real batch uses (txBuilder reads these).
  if (typeof params.min_fee_a !== "number" || typeof params.min_fee_b !== "number") {
    throw new Error(
      `epochsLatestParameters missing min_fee_a / min_fee_b: ${JSON.stringify(params)}`,
    );
  }
  if (typeof params.max_tx_size !== "number") {
    throw new Error(
      `epochsLatestParameters missing max_tx_size: ${JSON.stringify(params)}`,
    );
  }
  return `epoch=${params.epoch} min_fee_a=${params.min_fee_a} min_fee_b=${params.min_fee_b} max_tx_size=${params.max_tx_size}`;
}

// ---------------------------------------------------------------------------
// Step 4 — metadata 1985 construction (dry-run, no submit)
// ---------------------------------------------------------------------------

/**
 * Build a representative AuxiliaryData mirroring a real anchor batch:
 *   - 1 tx Merkle root (32 bytes)
 *   - 1 vc Merkle root (32 bytes)
 *   - 2 DID ops (CREATE + UPDATE) with realistic chunk lengths
 *
 * If anything in the metadata serialization is broken (CSL update, encoding
 * regression, 16 KB ceiling overshoot) this throws and the canary fails.
 */
function buildSampleMetadata(): string {
  const sampleRoot = blake2b(new TextEncoder().encode("canary-tx"), { dkLen: 32 });
  const sampleVcRoot = blake2b(new TextEncoder().encode("canary-vc"), { dkLen: 32 });
  const sampleDocHash = blake2b(new TextEncoder().encode("canary-doc"), { dkLen: 32 });

  const ops: DidOp[] = [
    {
      k: "c",
      did: "did:web:api.civicship.app:users:canary-create",
      h: bytesToHex(sampleDocHash),
      doc: {
        "@context": ["https://www.w3.org/ns/did/v1"],
        id: "did:web:api.civicship.app:users:canary-create",
        verificationMethod: [
          {
            id: "did:web:api.civicship.app:users:canary-create#key-1",
            type: "Ed25519VerificationKey2020",
            controller: "did:web:api.civicship.app:users:canary-create",
            publicKeyMultibase: "z6Mk" + "x".repeat(44),
          },
        ],
      },
      prev: null,
    },
    {
      k: "u",
      did: "did:web:api.civicship.app:users:canary-update",
      h: bytesToHex(sampleDocHash),
      doc: {
        "@context": ["https://www.w3.org/ns/did/v1"],
        id: "did:web:api.civicship.app:users:canary-update",
      },
      prev: bytesToHex(sampleRoot),
    },
  ];

  const aux = buildAuxiliaryData({
    bid: `canary_${Date.now().toString(36)}`,
    ts: Math.floor(Date.now() / 1000),
    tx: { root: sampleRoot, count: 1 },
    vc: { root: sampleVcRoot, count: 1 },
    ops,
  });

  // Serialize to CBOR bytes — this is the same path the chain will see.
  const cborBytes = aux.to_bytes();
  const sizeBytes = cborBytes.length;
  if (sizeBytes >= MAX_METADATA_TX_BYTES) {
    throw new Error(
      `sample metadata is ${sizeBytes}B (>= ceiling ${MAX_METADATA_TX_BYTES}B). ` +
        "txBuilder size estimation has regressed.",
    );
  }
  return `AuxiliaryData CBOR size=${sizeBytes}B (ceiling ${MAX_METADATA_TX_BYTES}B), 2 ops, 1 tx root, 1 vc root`;
}

function bytesToHex(b: Uint8Array): string {
  let s = "";
  for (let i = 0; i < b.length; i++) s += b[i].toString(16).padStart(2, "0");
  return s;
}

// ---------------------------------------------------------------------------
// Entrypoint
// ---------------------------------------------------------------------------

async function main(): Promise<number> {
  process.stdout.write("Cardano preprod canary (anchor batch dry-run)\n\n");

  const results: StepResult[] = [];

  const envStep = await runStep("env: BLOCKFROST_PROJECT_ID is preprod*", async () => {
    const id = requirePreprodProjectId();
    return `project_id prefix OK (${id.slice(0, 8)}...)`;
  });
  results.push(envStep);
  if (!envStep.ok) return summarize(results);

  const projectId = process.env.BLOCKFROST_PROJECT_ID as string;
  const api = new BlockFrostAPI({ projectId, network: "preprod" });

  results.push(
    await runStep("blockfrost: health()", () => checkBlockfrostHealth(api)),
  );
  if (!results[results.length - 1].ok) return summarize(results);

  const thresholdSeconds = Number(
    process.env.CANARY_BLOCK_FRESHNESS_SECONDS ?? "1800",
  );
  results.push(
    await runStep(
      `blockfrost: blocksLatest() freshness < ${thresholdSeconds}s`,
      () => checkPreprodBlockFreshness(api, thresholdSeconds),
    ),
  );
  if (!results[results.length - 1].ok) return summarize(results);

  results.push(
    await runStep("blockfrost: epochsLatestParameters()", () =>
      checkProtocolParams(api),
    ),
  );
  if (!results[results.length - 1].ok) return summarize(results);

  results.push(
    await runStep("txBuilder: build sample metadata 1985 (no submit)", async () =>
      buildSampleMetadata(),
    ),
  );

  return summarize(results);
}

function summarize(results: StepResult[]): number {
  const failed = results.filter((r) => !r.ok);
  process.stdout.write("\n--- Canary summary ---\n");
  for (const r of results) {
    process.stdout.write(`  [${r.ok ? "PASS" : "FAIL"}] ${r.name}\n`);
  }
  if (failed.length === 0) {
    process.stdout.write("\nAll canary checks passed.\n");
    return 0;
  }
  process.stdout.write(
    `\n${failed.length} of ${results.length} canary checks FAILED.\n`,
  );
  return 1;
}

main().then(
  (code) => process.exit(code),
  (err) => {
    process.stderr.write(`Unhandled canary error: ${(err as Error).stack ?? err}\n`);
    process.exit(1);
  },
);
