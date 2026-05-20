#!/usr/bin/env -S node --experimental-strip-types
/**
 * Manually trigger the weekly anchor batch on dev to verify that
 * `UserDidAnchor.chainOpIndex` is written by the `markSubmitted` path.
 *
 * What this script does
 * ---------------------
 *   1. INSERT one PENDING `UserDidAnchor` (operation=CREATE) for an
 *      existing user — no new user is created.
 *   2. Run the production weekly batch entry point
 *      `AnchorBatchUseCase.runBatch` against a fresh `weeklyKey`.
 *   3. Re-read the inserted anchor and assert `chainOpIndex` is non-null.
 *
 * `chainOpIndex` is persisted at the SUBMITTED stage
 * (`AnchorBatchRepository.markSubmitted`), so the verification still
 * PASSES even if `awaitConfirmation` times out — the batch then finishes
 * as FAILED but the op index is already written.
 *
 * Scope / safety
 * --------------
 *   - Existing CONFIRMED anchors are never touched (the batch only sweeps
 *     `status=PENDING AND batchId=NULL`).
 *   - The batch DOES sweep every other PENDING anchor in the database into
 *     the same Cardano tx — expected on dev.
 *   - mainnet is hard-refused (this is a dev-only verification tool).
 *   - `--confirm` 無しは dry-run（DB INSERT も Cardano submit もしない）。
 *   - A unique `weeklyKey` is chosen automatically so the batch's
 *     idempotency early-return never skips the inserted anchor.
 *
 * Required env (loaded from `.env.dev` via dotenvx):
 *   DATABASE_URL                       (always)
 *   BLOCKFROST_PROJECT_ID,
 *   CARDANO_PLATFORM_ADDRESS,
 *   CARDANO_PLATFORM_PRIVATE_KEY_HEX   (required for --confirm)
 *   CARDANO_NETWORK                    "preprod" (default) | refused if "mainnet"
 *
 * Run examples:
 *   pnpm exec dotenvx run -f .env.dev -- pnpm exec tsx scripts/manual-anchor-batch.ts
 *   pnpm exec dotenvx run -f .env.dev -- pnpm exec tsx scripts/manual-anchor-batch.ts --confirm
 *   pnpm exec dotenvx run -f .env.dev -- pnpm exec tsx scripts/manual-anchor-batch.ts --confirm --user-id=<id>
 *
 * Exit codes: 0 = PASS (or dry-run ok), 1 = FAIL.
 *
 * 設計参照:
 *   docs/report/did-vc-internalization.md §5.3.1 (週次バッチ)
 *   docs/report/did-vc-internalization.md §8.3   (chain inclusion / chainOpIndex)
 */

// `reflect-metadata` must load before any `@injectable()` decorator metadata
// is read by tsyringe — keep it the first import.
import "reflect-metadata";
// Side-effect import: runs `registerProductionDependencies()` so the DI
// container knows AnchorBatch* / Blockfrost* before we resolve the usecase.
import "@/application/provider";

import { container } from "tsyringe";
import { encode as cborEncode } from "cbor-x";
import { blake2b } from "@noble/hashes/blake2b";
import { AnchorStatus, ChainNetwork, DidOperation } from "@prisma/client";

import { prismaClient, PrismaClientIssuer } from "@/infrastructure/prisma/client";
import AnchorBatchUseCase from "@/application/domain/anchor/anchorBatch/usecase";
import {
  computeIsoWeeklyKey,
  isValidWeeklyKey,
} from "@/application/domain/anchor/anchorBatch/service";
import type { AnchorBatchHttpResponse } from "@/application/domain/anchor/anchorBatch/presenter";
import { buildMinimalDidDocument, buildUserDid } from "@/infrastructure/libs/did/userDidBuilder";
import { IContext } from "@/types/server";

import { bytesToHex, runStep } from "./lib/cardanoScriptHelpers.ts";

const DEFAULT_USER_ID = "cmidusltd000ps60enso2svvd";

interface Flags {
  confirm: boolean;
  userId: string;
  /** Preferred starting weeklyKey; the script bumps forward if it's used. */
  weeklyKey?: string;
}

function printUsage(): void {
  process.stdout.write(
    "Usage: tsx scripts/manual-anchor-batch.ts [--confirm] [--user-id=<id>] [--weekly-key=<YYYY-Www>]\n" +
      "  --confirm            actually INSERT + run the batch + submit to Cardano (default: dry-run)\n" +
      `  --user-id=<id>       existing user to anchor (default: ${DEFAULT_USER_ID})\n` +
      "  --weekly-key=<key>   preferred batchId; bumped forward if already used\n",
  );
}

function parseFlags(argv: string[]): Flags {
  const flags: Flags = { confirm: false, userId: DEFAULT_USER_ID };
  for (const arg of argv) {
    if (arg === "--confirm") {
      flags.confirm = true;
      continue;
    }
    if (arg === "-h" || arg === "--help") {
      printUsage();
      process.exit(0);
    }
    const uid = /^--user-id=(.+)$/.exec(arg);
    if (uid) {
      flags.userId = uid[1];
      continue;
    }
    const wk = /^--weekly-key=(.+)$/.exec(arg);
    if (wk) {
      if (!isValidWeeklyKey(wk[1])) {
        throw new Error(`--weekly-key must match YYYY-Www (ISO week), got "${wk[1]}"`);
      }
      flags.weeklyKey = wk[1];
      continue;
    }
    throw new Error(`Unknown flag: ${arg}`);
  }
  return flags;
}

function resolveChainNetwork(): ChainNetwork {
  return (process.env.CARDANO_NETWORK ?? "preprod") === "mainnet"
    ? ChainNetwork.CARDANO_MAINNET
    : ChainNetwork.CARDANO_PREPROD;
}

/** CBOR-encode the minimal DID Document and Blake2b-256 hash it (§5.1.7). */
function encodeAndHashUserDoc(userId: string): { cbor: Uint8Array; hashHex: string } {
  const doc = buildMinimalDidDocument(userId);
  const raw = cborEncode(doc);
  const cbor = raw instanceof Uint8Array ? raw : new Uint8Array(raw);
  const hash = blake2b(cbor, { dkLen: 32 });
  return { cbor, hashHex: bytesToHex(hash) };
}

/**
 * Next ISO-shaped weekly key. ISO 8601 allows week 53, and
 * `isValidWeeklyKey` accepts 1-53, so roll over only past W53.
 */
function nextWeeklyKey(key: string): string {
  const year = Number.parseInt(key.slice(0, 4), 10);
  const week = Number.parseInt(key.slice(6, 8), 10);
  if (week >= 53) return `${year + 1}-W01`;
  return `${year}-W${String(week + 1).padStart(2, "0")}`;
}

/** A weeklyKey is "used" if any anchor row already carries it as batchId. */
async function isWeeklyKeyUsed(key: string): Promise<boolean> {
  const [txn, vc, did] = await Promise.all([
    prismaClient.transactionAnchor.count({ where: { batchId: key } }),
    prismaClient.vcAnchor.count({ where: { batchId: key } }),
    prismaClient.userDidAnchor.count({ where: { batchId: key } }),
  ]);
  return txn + vc + did > 0;
}

/**
 * Find a weeklyKey not yet claimed by any batch. The weekly batch
 * early-returns when a key already has SUBMITTED/CONFIRMED rows, which
 * would skip our freshly-inserted anchor — so we always run against a
 * fresh key.
 */
async function resolveUnusedWeeklyKey(preferred: string): Promise<string> {
  let key = preferred;
  for (let i = 0; i < 60; i++) {
    if (!(await isWeeklyKeyUsed(key))) return key;
    key = nextWeeklyKey(key);
  }
  throw new Error(`could not find an unused weeklyKey starting from ${preferred}`);
}

async function main(): Promise<number> {
  const flags = parseFlags(process.argv.slice(2));
  process.stdout.write("Manual anchor-batch trigger — verify UserDidAnchor.chainOpIndex\n\n");
  process.stdout.write(`mode: ${flags.confirm ? "EXECUTE (--confirm)" : "DRY-RUN"}\n`);
  process.stdout.write(`target user: ${flags.userId}\n\n`);

  // Step 1 — env guard + credentials
  const envStep = await runStep<void>("env: dev/preprod guard + credentials", async () => {
    const network = process.env.CARDANO_NETWORK ?? "preprod";
    if (network === "mainnet") {
      throw new Error('CARDANO_NETWORK="mainnet" — this verification script is dev-only.');
    }
    const projectId = process.env.BLOCKFROST_PROJECT_ID;
    if (projectId && projectId.startsWith("mainnet")) {
      throw new Error("BLOCKFROST_PROJECT_ID looks like a mainnet key — refusing.");
    }
    if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is unset");
    if (flags.confirm) {
      const missing = [
        "BLOCKFROST_PROJECT_ID",
        "CARDANO_PLATFORM_ADDRESS",
        "CARDANO_PLATFORM_PRIVATE_KEY_HEX",
      ].filter((k) => !process.env[k]);
      if (missing.length) {
        throw new Error(`unset env (required for --confirm): ${missing.join(", ")}`);
      }
    }
    return {
      value: undefined,
      detail: flags.confirm
        ? `network=${network}, address=${process.env.CARDANO_PLATFORM_ADDRESS}`
        : `network=${network} (dry-run: Cardano creds not required)`,
    };
  });
  if (!envStep.ok) return 1;

  // Step 2 — target user must exist (UserDidAnchor.userId is a Restrict FK)
  const userStep = await runStep<void>("db: target user exists", async () => {
    const user = await prismaClient.user.findUnique({
      where: { id: flags.userId },
      select: { id: true, name: true },
    });
    if (!user) throw new Error(`user "${flags.userId}" not found in this database`);
    return { value: undefined, detail: `id=${user.id}, name=${user.name ?? "(no name)"}` };
  });
  if (!userStep.ok) return 1;

  // Step 3 — survey pending anchors + resolve a fresh weeklyKey
  const preferredKey = flags.weeklyKey ?? computeIsoWeeklyKey();
  const surveyStep = await runStep<{ weeklyKey: string }>(
    "db: survey pending anchors + resolve weeklyKey",
    async () => {
      const [pendingTx, pendingVc, pendingDid] = await Promise.all([
        prismaClient.transactionAnchor.count({
          where: { status: AnchorStatus.PENDING, batchId: null },
        }),
        prismaClient.vcAnchor.count({
          where: { status: AnchorStatus.PENDING, batchId: null },
        }),
        prismaClient.userDidAnchor.count({
          where: { status: AnchorStatus.PENDING, batchId: null },
        }),
      ]);
      const weeklyKey = await resolveUnusedWeeklyKey(preferredKey);
      const bumped = weeklyKey !== preferredKey ? ` (preferred ${preferredKey} already used)` : "";
      return {
        value: { weeklyKey },
        detail:
          `weeklyKey=${weeklyKey}${bumped}; existing PENDING anchors swept by the batch: ` +
          `tx=${pendingTx}, vc=${pendingVc}, userDid=${pendingDid}`,
      };
    },
  );
  if (!surveyStep.ok) return 1;
  const { weeklyKey } = surveyStep.value;

  if (!flags.confirm) {
    process.stdout.write(
      "\nDRY-RUN complete. With --confirm the script will:\n" +
        `  1. INSERT 1 PENDING UserDidAnchor (operation=CREATE) for user ${flags.userId}\n` +
        `  2. run AnchorBatchUseCase.runBatch({ weeklyKey: "${weeklyKey}" }) — submits a real preprod tx\n` +
        "  3. verify the inserted anchor's chainOpIndex is non-null\n" +
        "\nRe-run with --confirm to execute.\n",
    );
    return 0;
  }

  // ---------- EXECUTE path ----------

  // Step 4 — INSERT the PENDING UserDidAnchor to be verified
  const insertStep = await runStep<{ anchorId: string }>(
    "db: INSERT PENDING UserDidAnchor (operation=CREATE)",
    async () => {
      const did = buildUserDid(flags.userId);
      const { cbor, hashHex } = encodeAndHashUserDoc(flags.userId);
      const created = await prismaClient.userDidAnchor.create({
        data: {
          userId: flags.userId,
          did,
          operation: DidOperation.CREATE,
          documentHash: hashHex,
          documentCbor: Buffer.from(cbor),
          network: resolveChainNetwork(),
          status: AnchorStatus.PENDING,
        },
        select: { id: true },
      });
      return { value: { anchorId: created.id }, detail: `anchorId=${created.id}, did=${did}` };
    },
  );
  if (!insertStep.ok) return 1;
  const { anchorId } = insertStep.value;

  // Step 5 — run the production weekly batch entry point
  process.stdout.write(
    "\n(the batch builds + submits a Cardano tx and awaits confirmation — this can take minutes)\n",
  );
  const batchStep = await runStep<AnchorBatchHttpResponse>(
    `batch: AnchorBatchUseCase.runBatch(weeklyKey=${weeklyKey})`,
    async () => {
      const issuer = container.resolve<PrismaClientIssuer>("PrismaClientIssuer");
      const ctx = { issuer } as IContext;
      const usecase = container.resolve(AnchorBatchUseCase);
      const result = await usecase.runBatch(ctx, { weeklyKey });
      return {
        value: result,
        detail:
          `status=${result.status}, submitted=${result.submitted}, ` +
          `txHash=${result.txHash ?? "null"}, counts=${JSON.stringify(result.anchorCounts)}`,
      };
    },
  );
  const batchResult = batchStep.ok ? batchStep.value : null;

  // Step 6 — verify chainOpIndex was written. Run this even when the batch
  // step errored: chainOpIndex is persisted at SUBMITTED, so an
  // awaitConfirmation timeout (batch ends FAILED) still proves the write.
  const verifyStep = await runStep<void>(
    "verify: inserted anchor chainOpIndex is non-null",
    async () => {
      const row = await prismaClient.userDidAnchor.findUnique({
        where: { id: anchorId },
        select: {
          status: true,
          chainOpIndex: true,
          chainTxHash: true,
          batchId: true,
          lastError: true,
        },
      });
      if (!row) throw new Error(`anchor ${anchorId} disappeared`);
      if (row.chainOpIndex === null) {
        throw new Error(
          `chainOpIndex is NULL — status=${row.status}, batchId=${row.batchId ?? "null"}, ` +
            `lastError=${row.lastError ?? "none"}`,
        );
      }
      return {
        value: undefined,
        detail:
          `chainOpIndex=${row.chainOpIndex}, status=${row.status}, ` +
          `chainTxHash=${row.chainTxHash ?? "null"}`,
      };
    },
  );

  process.stdout.write(`\n${"=".repeat(64)}\n`);
  if (verifyStep.ok) {
    process.stdout.write("PASS: the anchor batch wrote UserDidAnchor.chainOpIndex.\n");
    if (batchResult && batchResult.status === "FAILED") {
      process.stdout.write(
        "Note: the batch finished as FAILED (likely an awaitConfirmation timeout), but\n" +
          "chainOpIndex is persisted at the SUBMITTED stage — the write path is verified.\n",
      );
    }
    return 0;
  }
  process.stdout.write("FAIL: UserDidAnchor.chainOpIndex was not written.\n");
  if (batchResult) {
    process.stdout.write(
      `  batch status=${batchResult.status}, failureReason=${batchResult.failureReason ?? "none"}\n`,
    );
  } else {
    process.stdout.write(`  runBatch threw: ${batchStep.detail}\n`);
  }
  return 1;
}

main()
  .then((code) => {
    prismaClient.$disconnect().finally(() => process.exit(code));
  })
  .catch((err: unknown) => {
    process.stderr.write(
      `ERROR: ${err instanceof Error ? (err.stack ?? err.message) : String(err)}\n`,
    );
    prismaClient.$disconnect().finally(() => process.exit(1));
  });
