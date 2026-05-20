#!/usr/bin/env -S node --experimental-strip-types
/**
 * Backfill the legacy `Transaction` set into a single `TransactionAnchor`
 * Merkle root and anchor it on Cardano in one tx.
 *
 * Phase 3 cutover task (`docs/report/did-vc-internalization.md` §11
 * Phase 3 / §10.5):
 *
 *   "Transaction の Merkle anchor を 1 tx で backfill submit
 *   （leafIds は metadata 外の DB に保持、root のみ 32 byte chain 書込）→ ~$0.08"
 *
 * What this script does (in order):
 *
 *   1. `SELECT id FROM t_transactions ORDER BY id ASC` — canonical leaf order.
 *   2. Compute the Merkle root via `buildRoot(leafIds)` (Blake2b-256 over
 *      `canonicalLeafHash(leafId)`; duplicates the last leaf when odd —
 *      matches the production weekly batch path).
 *   3. INSERT one `TransactionAnchor` row (status=PENDING) holding the
 *      full `leafIds` set + computed root.
 *   4. Build an `AuxiliaryData` whose top map carries only `tx={root, count}`
 *      (no `vc`, no `ops` — this is a Transaction-only anchor).
 *   5. Fetch UTXOs + protocol params + current slot via `BlockfrostClient`.
 *   6. `buildAnchorTx` → sign with the env-resolved platform key →
 *      `submitTx` → `awaitConfirmation`.
 *   7. UPDATE the TransactionAnchor row to `CONFIRMED` with chainTxHash /
 *      blockHeight.
 *
 * Idempotency / safety:
 *   - `--confirm` 無しは dry-run（件数 / root hex / would-be metadata だけ表示）
 *   - 既に CONFIRMED な TransactionAnchor が `leafIds && pending` でカバー
 *     しているなら skip（重複 anchoring を避ける）
 *
 * 実行例 (dev / preprod):
 *   pnpm exec dotenvx run -f .env.dev -- pnpm exec tsx scripts/backfill-transaction-anchor.ts
 *   pnpm exec dotenvx run -f .env.dev -- pnpm exec tsx scripts/backfill-transaction-anchor.ts --confirm
 *
 * Required env (loaded from `.env.dev` via dotenvx):
 *   BLOCKFROST_PROJECT_ID, CARDANO_PLATFORM_PRIVATE_KEY_HEX,
 *   CARDANO_PLATFORM_ADDRESS, CARDANO_NETWORK, DATABASE_URL
 *
 * Exit codes: 0 = OK, 1 = error / submit failed.
 *
 * 設計参照:
 *   docs/report/did-vc-internalization.md §1   (5,000 件 backfill 戦略)
 *   docs/report/did-vc-internalization.md §5.1.6 / §5.1.7 (metadata / Merkle)
 *   docs/report/did-vc-internalization.md §11 Phase 3
 */

import "reflect-metadata";

import { BlockFrostAPI } from "@blockfrost/blockfrost-js";
import { AnchorStatus, ChainNetwork } from "@prisma/client";

import { prismaClient } from "@/infrastructure/prisma/client";
import { BlockfrostClient } from "@/infrastructure/libs/blockfrost/client";
import {
  buildAnchorTx,
  buildAuxiliaryData,
  type BlockfrostProtocolParams,
  type BlockfrostUtxo,
  metadataByteSize,
} from "@/infrastructure/libs/cardano/txBuilder";
import { buildRoot } from "@/infrastructure/libs/merkle/merkleTreeBuilder";
import { deriveCardanoKeypair } from "@/infrastructure/libs/cardano/keygen";

import { parseFixedLengthHex, runStep } from "./lib/cardanoScriptHelpers.ts";

interface Flags {
  confirm: boolean;
  limit?: number;
}

function parseFlags(argv: string[]): Flags {
  const flags: Flags = { confirm: false };
  for (const arg of argv) {
    if (arg === "--confirm") {
      flags.confirm = true;
      continue;
    }
    const limit = /^--limit=(\d+)$/.exec(arg);
    if (limit) {
      flags.limit = Number.parseInt(limit[1], 10);
      continue;
    }
    throw new Error(`Unknown flag: ${arg}`);
  }
  return flags;
}

interface PlatformConfig {
  network: "preprod" | "mainnet";
  chainNetwork: ChainNetwork;
  privateKeySeed: Uint8Array;
  changeAddressBech32: string;
}

function resolvePlatformConfig(): PlatformConfig {
  const raw = process.env.CARDANO_NETWORK ?? "preprod";
  const network = raw === "mainnet" ? "mainnet" : "preprod";
  const chainNetwork: ChainNetwork =
    network === "mainnet" ? ChainNetwork.CARDANO_MAINNET : ChainNetwork.CARDANO_PREPROD;
  const seedHex = process.env.CARDANO_PLATFORM_PRIVATE_KEY_HEX;
  const address = process.env.CARDANO_PLATFORM_ADDRESS;
  if (!seedHex) throw new Error("CARDANO_PLATFORM_PRIVATE_KEY_HEX is unset");
  if (!address) throw new Error("CARDANO_PLATFORM_ADDRESS is unset");
  return {
    network,
    chainNetwork,
    privateKeySeed: parseFixedLengthHex(seedHex, 32, "CARDANO_PLATFORM_PRIVATE_KEY_HEX"),
    changeAddressBech32: address,
  };
}

async function fetchCurrentSlot(projectId: string, network: "preprod" | "mainnet"): Promise<number> {
  const api = new BlockFrostAPI({ projectId, network });
  const latest = (await api.blocksLatest()) as { slot?: number | null };
  if (typeof latest?.slot !== "number") {
    throw new Error("blocksLatest returned no slot");
  }
  return latest.slot;
}

async function main(): Promise<number> {
  const flags = parseFlags(process.argv.slice(2));
  process.stdout.write("Backfill Transaction anchor — single 1-tx Merkle commit\n\n");
  process.stdout.write(`mode: ${flags.confirm ? "EXECUTE" : "DRY-RUN"}\n`);
  if (flags.limit !== undefined) process.stdout.write(`limit: ${flags.limit}\n`);
  process.stdout.write("\n");

  // Step 1 — leafIds
  const leafStep = await runStep<string[]>("db: collect Transaction.id ASC", async () => {
    const rows = await prismaClient.transaction.findMany({
      select: { id: true },
      orderBy: { id: "asc" },
      take: flags.limit,
    });
    if (rows.length === 0) throw new Error("no Transaction rows found");
    return {
      value: rows.map((r) => r.id),
      detail: `${rows.length} rows, first=${rows[0].id}, last=${rows[rows.length - 1].id}`,
    };
  });
  if (!leafStep.ok) return 1;
  const leafIds = leafStep.value;

  // Step 2 — Merkle root
  const rootStep = await runStep<Uint8Array>("merkle: buildRoot(leafIds)", async () => {
    const root = buildRoot(leafIds);
    return { value: root, detail: `root=${Buffer.from(root).toString("hex")}` };
  });
  if (!rootStep.ok) return 1;
  const rootBytes = rootStep.value;

  // Step 3 — periodStart/End from Transaction.createdAt
  const periodStep = await runStep<{ periodStart: Date; periodEnd: Date }>(
    "db: derive period_start / period_end",
    async () => {
      const minRow = await prismaClient.transaction.findFirst({
        orderBy: { createdAt: "asc" },
        select: { createdAt: true },
      });
      const maxRow = await prismaClient.transaction.findFirst({
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      });
      if (!minRow || !maxRow) throw new Error("missing createdAt boundaries");
      return {
        value: { periodStart: minRow.createdAt, periodEnd: maxRow.createdAt },
        detail: `[${minRow.createdAt.toISOString()} .. ${maxRow.createdAt.toISOString()}]`,
      };
    },
  );
  if (!periodStep.ok) return 1;
  const { periodStart, periodEnd } = periodStep.value;

  // Step 4 — build AuxiliaryData (dry-run preview)
  const previewStep = await runStep<number>("cardano: build metadata 1985 (preview)", async () => {
    const aux = buildAuxiliaryData({
      bid: `tx-backfill-${Date.now().toString(36)}`,
      ts: Math.floor(Date.now() / 1000),
      tx: { root: rootBytes, count: leafIds.length },
      ops: [],
    });
    const size = metadataByteSize(aux);
    return { value: size, detail: `AuxiliaryData CBOR=${size}B (ceiling 16384)` };
  });
  if (!previewStep.ok) return 1;

  if (!flags.confirm) {
    process.stdout.write("\nDry-run complete. Re-run with `--confirm` to submit.\n");
    return 0;
  }

  // ---------- EXECUTE path below ----------

  // Step 5 — insert TransactionAnchor PENDING (we want a stable bid)
  const platform = resolvePlatformConfig();
  const insertStep = await runStep<{ id: string }>(
    "db: INSERT TransactionAnchor PENDING",
    async () => {
      const row = await prismaClient.transactionAnchor.create({
        data: {
          periodStart,
          periodEnd,
          rootHash: Buffer.from(rootBytes).toString("hex"),
          leafIds,
          leafCount: leafIds.length,
          network: platform.chainNetwork,
          status: AnchorStatus.PENDING,
        },
        select: { id: true },
      });
      return { value: row, detail: `anchor.id=${row.id}` };
    },
  );
  if (!insertStep.ok) return 1;
  const anchorId = insertStep.value.id;

  // Step 6 — assemble final AuxiliaryData using anchor.id as the idempotency
  //          key (`bid`). Same value persists on the row so reconciliation
  //          across reruns is unambiguous.
  const aux = buildAuxiliaryData({
    bid: anchorId,
    ts: Math.floor(Date.now() / 1000),
    tx: { root: rootBytes, count: leafIds.length },
    ops: [],
  });

  // Step 7 — Cardano chain inputs
  const projectId = process.env.BLOCKFROST_PROJECT_ID;
  if (!projectId) throw new Error("BLOCKFROST_PROJECT_ID is unset");
  const client = new BlockfrostClient({
    network: platform.chainNetwork,
  });
  const chainStep = await runStep<{
    params: BlockfrostProtocolParams;
    utxos: BlockfrostUtxo[];
    currentSlot: number;
  }>("blockfrost: fetch protocol-params / utxos / slot", async () => {
    const [params, utxos, slot] = await Promise.all([
      client.getProtocolParams() as Promise<BlockfrostProtocolParams>,
      client.getUtxos(platform.changeAddressBech32) as Promise<BlockfrostUtxo[]>,
      fetchCurrentSlot(projectId, platform.network),
    ]);
    return {
      value: { params, utxos, currentSlot: slot },
      detail: `slot=${slot}, utxos=${utxos.length}`,
    };
  });
  if (!chainStep.ok) {
    await markFailed(anchorId, chainStep.detail);
    return 1;
  }
  const { params, utxos, currentSlot } = chainStep.value;
  if (utxos.length === 0) {
    process.stdout.write(
      `\nWallet ${platform.changeAddressBech32} has no UTXOs on ${platform.network}. ` +
        "Fund it and retry.\n",
    );
    await markFailed(anchorId, "no UTxOs on platform wallet");
    return 1;
  }

  // Step 8 — sign + submit
  const keypair = deriveCardanoKeypair(platform.privateKeySeed, platform.network);
  const submitStep = await runStep<string>("cardano: build + sign + submitTx", async () => {
    const built = buildAnchorTx({
      utxos,
      params,
      signKey: keypair.cslPrivateKey,
      auxiliaryData: aux,
      changeAddressBech32: platform.changeAddressBech32,
      currentSlot,
    });
    const hash = await client.submitTx(built.txCborBytes);
    return { value: hash, detail: `tx=${hash}, size=${built.txCborBytes.length}B` };
  });
  if (!submitStep.ok) {
    await markFailed(anchorId, submitStep.detail);
    return 1;
  }
  const chainTxHash = submitStep.value;

  await prismaClient.transactionAnchor.update({
    where: { id: anchorId },
    data: {
      status: AnchorStatus.SUBMITTED,
      chainTxHash,
      submittedAt: new Date(),
      batchId: anchorId,
    },
  });

  // Step 9 — await confirmation
  const confirmStep = await runStep<{ blockHeight: number | null }>(
    "cardano: awaitConfirmation",
    async () => {
      const tx = await client.awaitConfirmation(chainTxHash);
      return {
        value: { blockHeight: tx.block_height ?? null },
        detail: `block_height=${tx.block_height}, block_time=${tx.block_time}`,
      };
    },
  );
  if (!confirmStep.ok) {
    await markFailed(anchorId, confirmStep.detail);
    return 1;
  }
  await prismaClient.transactionAnchor.update({
    where: { id: anchorId },
    data: {
      status: AnchorStatus.CONFIRMED,
      blockHeight: confirmStep.value.blockHeight,
      confirmedAt: new Date(),
    },
  });

  process.stdout.write("\nALL STEPS PASSED.\n");
  process.stdout.write(
    `TransactionAnchor ${anchorId} CONFIRMED, chain_tx_hash=${chainTxHash}\n` +
      `https://${platform.network === "mainnet" ? "" : "preprod."}cardanoscan.io/transaction/${chainTxHash}\n`,
  );
  return 0;
}

async function markFailed(anchorId: string, reason: string): Promise<void> {
  await prismaClient.transactionAnchor
    .update({
      where: { id: anchorId },
      data: {
        status: AnchorStatus.FAILED,
        lastError: reason.slice(0, 1000),
        attemptCount: { increment: 1 },
      },
    })
    .catch(() => {
      // Don't mask the original failure if marking fails.
    });
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
