#!/usr/bin/env -S node --experimental-strip-types
/**
 * Backfill every existing civicship user with an `INTERNAL` `did:web` row
 * and anchor the corresponding CREATE op on Cardano.
 *
 * Phase 3 cutover task (`docs/report/did-vc-internalization.md` §11
 * Phase 3 / §10.5):
 *
 *   "全 ~1000 ユーザーの DidIssuanceRequest 行を INTERNAL で一括 INSERT
 *    ... DID 操作の chain backfill（doc hash のみ）を ~13 tx 連続 submit
 *    （tx 間隔 5-10 分、Cardano confirm 待機）"
 *
 * What this script does
 * ---------------------
 *
 *   1. SELECT every `User` that does NOT already have an `INTERNAL`
 *      `DidIssuanceRequest` row.
 *   2. For each: build `did:web:api.civicship.app:users:<userId>`,
 *      CBOR-encode the minimal DID Document, Blake2b-256 hash it, then
 *      INSERT (DB-only):
 *
 *        - `DidIssuanceRequest{ didMethod=INTERNAL, status=COMPLETED, didValue=did }`
 *        - `UserDidAnchor{ operation=CREATE, documentCbor, documentHash, status=PENDING }`
 *
 *   3. Chunk the freshly inserted `UserDidAnchor` rows into batches of
 *      `--chunk-size` (default 80, well under the 16 KB metadata ceiling)
 *      and for each chunk:
 *
 *        - Build `AuxiliaryData` with `ops: DidOp[]` only (no tx / vc roots
 *          — this is a DID-only anchor batch).
 *        - `buildAnchorTx` → `submitTx` → `awaitConfirmation`.
 *        - UPDATE the chunk's `UserDidAnchor` rows to
 *          `status=CONFIRMED, chainTxHash, batchId`.
 *        - Sleep `--inter-tx-sleep-ms` (default 5 min) before the next
 *          chunk to let the change UTxO settle.
 *
 * Idempotency / safety
 * --------------------
 *
 *   - `--confirm` 無しは dry-run（DB INSERT も Cardano submit もしない）。
 *   - 既に INTERNAL 行を持つ user は skip（重複 DID Document を生成しない）。
 *   - 既に SUBMITTED / CONFIRMED な UserDidAnchor も skip。
 *   - 失敗時は当該 UserDidAnchor を `status=FAILED` + `lastError` で残す。
 *
 * Required env (loaded from `.env.dev` via dotenvx):
 *   BLOCKFROST_PROJECT_ID, CARDANO_PLATFORM_PRIVATE_KEY_HEX,
 *   CARDANO_PLATFORM_ADDRESS, CARDANO_NETWORK, DATABASE_URL
 *
 * 実行例:
 *   pnpm exec dotenvx run -f .env.dev -- pnpm exec tsx scripts/backfill-user-did.ts
 *   pnpm exec dotenvx run -f .env.dev -- pnpm exec tsx scripts/backfill-user-did.ts --confirm
 *   pnpm exec dotenvx run -f .env.dev -- pnpm exec tsx scripts/backfill-user-did.ts --confirm --chunk-size=10 --inter-tx-sleep-ms=30000
 *
 * Exit codes: 0 = all chunks confirmed, 1 = any chunk failed.
 *
 * 設計参照:
 *   docs/report/did-vc-internalization.md §1   (1000 ユーザー、~13 tx)
 *   docs/report/did-vc-internalization.md §3.3 (CBOR-encoded DID Document on chain)
 *   docs/report/did-vc-internalization.md §5.1.6 / §5.1.7 (metadata / Merkle)
 *   docs/report/did-vc-internalization.md §11 Phase 3 Day 1
 */

import "reflect-metadata";

import { encode as cborEncode } from "cbor-x";
import { blake2b } from "@noble/hashes/blake2b";
import { BlockFrostAPI } from "@blockfrost/blockfrost-js";
import {
  AnchorStatus,
  ChainNetwork,
  DidIssuanceStatus,
  DidMethod,
  DidOperation,
} from "@prisma/client";

import { prismaClient } from "@/infrastructure/prisma/client";
import { BlockfrostClient } from "@/infrastructure/libs/blockfrost/client";
import {
  buildAnchorTx,
  buildAuxiliaryData,
  type BlockfrostProtocolParams,
  type BlockfrostUtxo,
  type DidOp,
  metadataByteSize,
  MAX_METADATA_TX_BYTES,
} from "@/infrastructure/libs/cardano/txBuilder";
import {
  buildMinimalDidDocument,
  buildUserDid,
} from "@/infrastructure/libs/did/userDidBuilder";
import { deriveCardanoKeypair } from "@/infrastructure/libs/cardano/keygen";

import { parseFixedLengthHex, runStep } from "./lib/cardanoScriptHelpers.ts";

const DEFAULT_CHUNK_SIZE = 80;
const DEFAULT_INTER_TX_SLEEP_MS = 5 * 60 * 1000;

interface Flags {
  confirm: boolean;
  userLimit?: number;
  chunkSize: number;
  interTxSleepMs: number;
}

function parseFlags(argv: string[]): Flags {
  const flags: Flags = {
    confirm: false,
    chunkSize: DEFAULT_CHUNK_SIZE,
    interTxSleepMs: DEFAULT_INTER_TX_SLEEP_MS,
  };
  for (const arg of argv) {
    if (arg === "--confirm") {
      flags.confirm = true;
      continue;
    }
    const userLimit = /^--user-limit=(\d+)$/.exec(arg);
    if (userLimit) {
      flags.userLimit = Number.parseInt(userLimit[1], 10);
      continue;
    }
    const chunk = /^--chunk-size=(\d+)$/.exec(arg);
    if (chunk) {
      flags.chunkSize = Number.parseInt(chunk[1], 10);
      continue;
    }
    const sleep = /^--inter-tx-sleep-ms=(\d+)$/.exec(arg);
    if (sleep) {
      flags.interTxSleepMs = Number.parseInt(sleep[1], 10);
      continue;
    }
    throw new Error(`Unknown flag: ${arg}`);
  }
  if (flags.chunkSize <= 0) throw new Error("--chunk-size must be > 0");
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

function encodeAndHashUserDoc(userId: string): { cbor: Uint8Array; hashHex: string } {
  const doc = buildMinimalDidDocument(userId);
  const raw = cborEncode(doc);
  const cbor = raw instanceof Uint8Array ? raw : new Uint8Array(raw);
  const hash = blake2b(cbor, { dkLen: 32 });
  let s = "";
  for (const b of hash) s += b.toString(16).padStart(2, "0");
  return { cbor, hashHex: s };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function findUsersWithoutInternal(limit?: number): Promise<{ id: string }[]> {
  // Users without an INTERNAL DidIssuanceRequest row. We don't gate on
  // `User.deletedAt` because the design intentionally backfills every row
  // currently present in `t_users` — soft-deleted users may still need a
  // resolvable did:web for past VC verification (§9.7 spec).
  return prismaClient.user.findMany({
    where: {
      didIssuanceRequests: {
        none: { didMethod: DidMethod.INTERNAL },
      },
    },
    select: { id: true },
    orderBy: { id: "asc" },
    take: limit,
  });
}

async function fetchCurrentSlot(projectId: string, network: "preprod" | "mainnet"): Promise<number> {
  const api = new BlockFrostAPI({ projectId, network });
  const latest = (await api.blocksLatest()) as { slot?: number | null };
  if (typeof latest?.slot !== "number") {
    throw new Error("blocksLatest returned no slot");
  }
  return latest.slot;
}

interface PendingAnchorRow {
  id: string;
  did: string;
  documentHash: string;
  documentCbor: Buffer | null;
}

async function findPendingAnchors(chunkSize: number): Promise<PendingAnchorRow[]> {
  return prismaClient.userDidAnchor.findMany({
    where: {
      status: AnchorStatus.PENDING,
      batchId: null,
      operation: DidOperation.CREATE,
    },
    select: {
      id: true,
      did: true,
      documentHash: true,
      documentCbor: true,
    },
    orderBy: { createdAt: "asc" },
    take: chunkSize,
  });
}

async function main(): Promise<number> {
  const flags = parseFlags(process.argv.slice(2));
  process.stdout.write("Backfill User DID (INTERNAL did:web) — DB + chunked Cardano submit\n\n");
  process.stdout.write(`mode: ${flags.confirm ? "EXECUTE" : "DRY-RUN"}\n`);
  process.stdout.write(`chunk-size: ${flags.chunkSize}\n`);
  process.stdout.write(`inter-tx-sleep-ms: ${flags.interTxSleepMs}\n`);
  if (flags.userLimit !== undefined) process.stdout.write(`user-limit: ${flags.userLimit}\n`);
  process.stdout.write("\n");

  // Step 1 — survey
  const surveyStep = await runStep<{ id: string }[]>(
    "db: users without INTERNAL DidIssuanceRequest",
    async () => {
      const users = await findUsersWithoutInternal(flags.userLimit);
      return {
        value: users,
        detail: `${users.length} user(s) to backfill (~${Math.ceil(users.length / flags.chunkSize)} tx)`,
      };
    },
  );
  if (!surveyStep.ok) return 1;
  const users = surveyStep.value;
  if (users.length === 0) {
    process.stdout.write("Nothing to do — every user already has an INTERNAL did:web.\n");
    return 0;
  }

  if (!flags.confirm) {
    process.stdout.write("\nDry-run complete. Re-run with `--confirm` to apply.\n");
    return 0;
  }

  // ---------- EXECUTE path below ----------

  const platform = resolvePlatformConfig();
  const projectId = process.env.BLOCKFROST_PROJECT_ID;
  if (!projectId) throw new Error("BLOCKFROST_PROJECT_ID is unset");

  // Step 2 — INSERT DidIssuanceRequest INTERNAL + UserDidAnchor PENDING for each user
  let insertedDids = 0;
  let insertedAnchors = 0;
  const insertStep = await runStep<{ inserted: number }>(
    "db: INSERT INTERNAL DidIssuanceRequest + PENDING UserDidAnchor",
    async () => {
      for (const user of users) {
        const did = buildUserDid(user.id);
        const { cbor, hashHex } = encodeAndHashUserDoc(user.id);

        await prismaClient.$transaction(async (tx) => {
          // INTERNAL did issuance row (idempotent — should be missing
          // by virtue of the WHERE in findUsersWithoutInternal, but
          // race-safe via the `didMethod` filter below)
          const existing = await tx.didIssuanceRequest.findFirst({
            where: { userId: user.id, didMethod: DidMethod.INTERNAL },
            select: { id: true },
          });
          if (!existing) {
            await tx.didIssuanceRequest.create({
              data: {
                userId: user.id,
                didMethod: DidMethod.INTERNAL,
                status: DidIssuanceStatus.COMPLETED,
                didValue: did,
                completedAt: new Date(),
                processedAt: new Date(),
              },
            });
            insertedDids += 1;
          }
          // Skip anchor INSERT if a CREATE anchor already exists for this user
          // (e.g. backfill was partially run).
          const existingAnchor = await tx.userDidAnchor.findFirst({
            where: { userId: user.id, operation: DidOperation.CREATE },
            select: { id: true },
          });
          if (!existingAnchor) {
            await tx.userDidAnchor.create({
              data: {
                userId: user.id,
                did,
                operation: DidOperation.CREATE,
                documentHash: hashHex,
                documentCbor: Buffer.from(cbor),
                network: platform.chainNetwork,
                status: AnchorStatus.PENDING,
              },
            });
            insertedAnchors += 1;
          }
        });
      }
      return {
        value: { inserted: insertedAnchors },
        detail: `${insertedDids} did row(s), ${insertedAnchors} anchor row(s) inserted`,
      };
    },
  );
  if (!insertStep.ok) return 1;

  // Step 3 — chunked chain submission
  const platformKey = deriveCardanoKeypair(platform.privateKeySeed, platform.network);
  const client = new BlockfrostClient({ network: platform.chainNetwork });
  let chunkIdx = 0;
  let confirmedTotal = 0;
  let failedTotal = 0;

  for (;;) {
    const chunk = await findPendingAnchors(flags.chunkSize);
    if (chunk.length === 0) break;
    chunkIdx += 1;

    const ops: DidOp[] = chunk.map((row) => {
      const docCbor = row.documentCbor ?? Buffer.alloc(0);
      return {
        k: "c",
        did: row.did,
        h: row.documentHash,
        docCbor: docCbor instanceof Uint8Array ? new Uint8Array(docCbor) : new Uint8Array(docCbor),
        prev: null,
      };
    });

    const bid = `did-backfill-${chunkIdx}-${Date.now().toString(36)}`;
    const aux = buildAuxiliaryData({
      bid,
      ts: Math.floor(Date.now() / 1000),
      ops,
    });
    const size = metadataByteSize(aux);
    if (size > MAX_METADATA_TX_BYTES) {
      process.stderr.write(
        `chunk ${chunkIdx} metadata ${size}B exceeds 16KB ceiling; lower --chunk-size and retry\n`,
      );
      await markChunkFailed(chunk, `metadata oversize (${size}B)`);
      failedTotal += chunk.length;
      return 1;
    }

    const submitOk = await runStep<string>(
      `cardano(${chunkIdx}): submit + confirm ${chunk.length} CREATE ops (meta=${size}B)`,
      async () => {
        const [params, utxos, currentSlot] = await Promise.all([
          client.getProtocolParams() as Promise<BlockfrostProtocolParams>,
          client.getUtxos(platform.changeAddressBech32) as Promise<BlockfrostUtxo[]>,
          fetchCurrentSlot(projectId, platform.network),
        ]);
        if (utxos.length === 0) {
          throw new Error("platform wallet has no UTXOs — fund and retry");
        }
        const built = buildAnchorTx({
          utxos,
          params,
          signKey: platformKey.cslPrivateKey,
          auxiliaryData: aux,
          changeAddressBech32: platform.changeAddressBech32,
          currentSlot,
        });
        const txHash = await client.submitTx(built.txCborBytes);
        // Mark SUBMITTED early so a crash mid-await still leaves a trail.
        await prismaClient.userDidAnchor.updateMany({
          where: { id: { in: chunk.map((r) => r.id) } },
          data: {
            status: AnchorStatus.SUBMITTED,
            chainTxHash: txHash,
            submittedAt: new Date(),
            batchId: bid,
          },
        });
        const confirmed = await client.awaitConfirmation(txHash);
        await prismaClient.userDidAnchor.updateMany({
          where: { id: { in: chunk.map((r) => r.id) } },
          data: {
            status: AnchorStatus.CONFIRMED,
            confirmedAt: new Date(),
          },
        });
        return {
          value: txHash,
          detail: `tx=${txHash}, block_height=${confirmed.block_height ?? "null"}`,
        };
      },
    );
    if (!submitOk.ok) {
      await markChunkFailed(chunk, submitOk.detail);
      failedTotal += chunk.length;
      // Bail out — re-running picks up the FAILED rows once the operator
      // resets them to PENDING (manual). Continuing would keep burning
      // ADA on the same broken state.
      break;
    }
    confirmedTotal += chunk.length;

    // Inter-tx sleep to let change UTxO settle (avoids "input not found"
    // when the next chunk's getUtxos picks up before propagation).
    process.stdout.write(`   sleeping ${flags.interTxSleepMs}ms before next chunk\n`);
    await sleep(flags.interTxSleepMs);
  }

  process.stdout.write(
    `\nchunks=${chunkIdx}, confirmed_anchors=${confirmedTotal}, failed_anchors=${failedTotal}\n`,
  );
  return failedTotal === 0 ? 0 : 1;
}

async function markChunkFailed(
  rows: ReadonlyArray<{ id: string }>,
  reason: string,
): Promise<void> {
  await prismaClient.userDidAnchor
    .updateMany({
      where: { id: { in: rows.map((r) => r.id) } },
      data: {
        status: AnchorStatus.FAILED,
      },
    })
    .catch(() => {
      // best-effort; don't mask the original failure
      process.stderr.write(`(failed to mark chunk as FAILED: ${reason})\n`);
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
