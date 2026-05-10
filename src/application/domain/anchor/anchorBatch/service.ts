/**
 * AnchorBatchService.
 *
 * 週次で PENDING な UserDidAnchor / VcAnchor / TransactionAnchor を 1 つの Cardano
 * tx に集約して anchor する。
 *
 * 設計参照:
 *   docs/report/did-vc-internalization.md §5.1.6 (label 1985 metadata)
 *   docs/report/did-vc-internalization.md §5.1.7 (Merkle 構築)
 *   docs/report/did-vc-internalization.md §5.2.3 (anchor ドメイン)
 *   docs/report/did-vc-internalization.md §5.3.1 (週次バッチ + idempotency)
 */

import { inject, injectable } from "tsyringe";
import * as CSL from "@emurgo/cardano-serialization-lib-nodejs";
import { AnchorStatus, DidOperation } from "@prisma/client";
import { IContext } from "@/types/server";
import logger from "@/infrastructure/logging";
import { buildRoot } from "@/infrastructure/libs/merkle/merkleTreeBuilder";
import {
  buildAnchorTx,
  buildAuxiliaryData,
  type DidOp,
} from "@/infrastructure/libs/cardano/txBuilder";
import { BlockfrostClient } from "@/infrastructure/libs/blockfrost/client";
import { KmsSigner } from "@/infrastructure/libs/kms/kmsSigner";
import { deriveCardanoKeypair } from "@/infrastructure/libs/cardano/keygen";
import { IAnchorBatchRepository } from "@/application/domain/anchor/anchorBatch/data/interface";
import {
  AnchorBatchPendingSet,
  AnchorBatchRunResult,
  PendingUserDidAnchor,
  PendingVcAnchor,
  PendingTransactionAnchor,
} from "@/application/domain/anchor/anchorBatch/data/type";

/** awaitConfirmation のデフォルト timeout（5 分）。 */
const DEFAULT_CONFIRM_TIMEOUT_MS = 5 * 60 * 1000;

/** Cardano slot を取得するための小さなインターフェース。 */
export interface BlockfrostLatestSlotProvider {
  /** 最新ブロックの slot 番号を返す。 */
  getCurrentSlot(): Promise<number>;
}

/**
 * Anchoring に必要な platform 鍵情報。env 変数から組み立てる。
 *
 * - `CARDANO_PLATFORM_PRIVATE_KEY_HEX`: 32-byte ed25519 seed の hex (raw)。
 *   KMS 経由で署名する Phase 2 までの暫定。Phase 1 では env から直接読む
 *   （§I 0-2: Phase 0 で生成した seed を Secret Manager で配信）。
 * - `CARDANO_PLATFORM_ADDRESS`: bech32 enterprise address（preprod / mainnet）。
 * - `CARDANO_PLATFORM_KMS_KEY_RESOURCE_NAME`: KMS 経由署名時のリソース名
 *   （Phase 2 以降）。Phase 1 では env_seed が優先される。
 */
export interface PlatformSignerConfig {
  /** Phase 1: raw 32-byte seed (hex)。 */
  privateKeyHex?: string;
  /** Phase 2: KMS resource name。 */
  kmsKeyResourceName?: string;
  /** issuer address (bech32)。 */
  changeAddressBech32: string;
  /** "preprod" | "mainnet"。 */
  network: "preprod" | "mainnet";
}

/**
 * AnchorBatchService が依存する外部 IO の集合。テスト容易性のため interface として
 * 切り出し、UseCase / DI から組み立てる。
 */
export interface AnchorBatchServiceDeps {
  repository: IAnchorBatchRepository;
  blockfrost: BlockfrostClient;
  slotProvider: BlockfrostLatestSlotProvider;
  /** Phase 1 では env から seed を直接渡す。Phase 2 で KmsSigner 経由に切替。 */
  signer?: KmsSigner;
  /** 設定（platform 鍵 / KMS resource）。 */
  signerConfig: PlatformSignerConfig;
  /** confirmation 待機 timeout (ms)。テスト時短縮用。 */
  confirmTimeoutMs?: number;
}

@injectable()
export class AnchorBatchService {
  /**
   * Phase 1 では env 上の raw seed (`CARDANO_PLATFORM_PRIVATE_KEY_HEX`) で
   * 直接署名する。KmsSigner は将来の Phase 2 切替（KMS 署名）に向けた
   * 配線を残すため inject だけしておく。実際に呼び出すのは Phase 2 で
   * tx body hash を `KmsSigner.signEd25519` に渡し、vkey witness を
   * 手動で attach する経路に差し替える時。
   */
  constructor(
    @inject("AnchorBatchRepository")
    private readonly repository: IAnchorBatchRepository,
    @inject("BlockfrostClient")
    private readonly blockfrost: BlockfrostClient,
    @inject("BlockfrostLatestSlotProvider")
    private readonly slotProvider: BlockfrostLatestSlotProvider,
    @inject("KmsSigner")
    private readonly _signer: KmsSigner,
  ) {
    // _signer は Phase 1 では未使用（Phase 2 で利用）。lint 抑制のため void。
    void this._signer;
  }

  /**
   * 週次バッチ実行。設計書 §5.3.1 のフローに沿う。
   *
   * 1. 同 weeklyKey の TransactionAnchor が SUBMITTED/CONFIRMED 済 → 早期 return
   * 2. PENDING + batchId IS NULL を全件取得
   * 3. 何も無ければ早期 return
   * 4. claim（CAS で batchId をセット）
   * 5. Merkle root 計算 + metadata 構築
   * 6. UTXO / 鍵を取得して tx 構築 + 署名
   * 7. submit + DB を SUBMITTED に
   * 8. awaitConfirmation → CONFIRMED / FAILED
   */
  async runWeeklyBatch(ctx: IContext, args: { weeklyKey: string }): Promise<AnchorBatchRunResult> {
    const { weeklyKey } = args;
    if (!isValidWeeklyKey(weeklyKey)) {
      throw new Error(
        `runWeeklyBatch: weeklyKey "${weeklyKey}" must match YYYY-Www (ISO 8601 week).`,
      );
    }

    // 1. idempotency 早期 return
    const terminal = await this.repository.getBatchTerminalStatus(ctx, weeklyKey);
    if (terminal === AnchorStatus.SUBMITTED || terminal === AnchorStatus.CONFIRMED) {
      logger.info("[AnchorBatchService] weeklyKey already processed; skipping", {
        weeklyKey,
        terminal,
      });
      const existing = await this.repository.findExistingBatchTransactionAnchors(ctx, weeklyKey);
      const txHash = await this.firstChainTxHashOf(ctx, weeklyKey);
      return {
        batchId: weeklyKey,
        submitted: true,
        txHash,
        anchorCounts: countsFor(existing, [], []),
        status: terminal,
      };
    }

    // 2. PENDING 取得
    const pending = await this.repository.findPendingAnchors(ctx);
    const total =
      pending.transactionAnchors.length + pending.vcAnchors.length + pending.userDidAnchors.length;
    if (total === 0) {
      logger.info("[AnchorBatchService] no PENDING anchors; nothing to submit", {
        weeklyKey,
      });
      return {
        batchId: weeklyKey,
        submitted: false,
        txHash: null,
        anchorCounts: { userDid: 0, vc: 0, tx: 0 },
        status: AnchorStatus.PENDING,
      };
    }

    // 3. claim（CAS）
    const ids = collectIds(pending);
    const claimed = await this.repository.claimPendingAnchors(ctx, {
      batchId: weeklyKey,
      ...ids,
    });
    if (
      claimed.transactionAnchors === 0 &&
      claimed.vcAnchors === 0 &&
      claimed.userDidAnchors === 0
    ) {
      logger.warn("[AnchorBatchService] CAS claimed 0 rows; another batch may be running", {
        weeklyKey,
      });
      return {
        batchId: weeklyKey,
        submitted: false,
        txHash: null,
        anchorCounts: { userDid: 0, vc: 0, tx: 0 },
        status: AnchorStatus.PENDING,
      };
    }

    try {
      const { txHash, blockHeight } = await this.buildAndSubmitAndConfirm(ctx, {
        weeklyKey,
        pending,
      });
      return {
        batchId: weeklyKey,
        submitted: true,
        txHash,
        anchorCounts: countsFor(
          pending.transactionAnchors,
          pending.vcAnchors,
          pending.userDidAnchors,
        ),
        status: blockHeight === null ? AnchorStatus.SUBMITTED : AnchorStatus.CONFIRMED,
      };
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      logger.error("[AnchorBatchService] batch failed", { weeklyKey, reason });
      await this.repository.markFailed(ctx, {
        batchId: weeklyKey,
        failureReason: reason,
        ...ids,
      });
      return {
        batchId: weeklyKey,
        submitted: false,
        txHash: null,
        anchorCounts: countsFor(
          pending.transactionAnchors,
          pending.vcAnchors,
          pending.userDidAnchors,
        ),
        status: AnchorStatus.FAILED,
        failureReason: reason,
      };
    }
  }

  /**
   * Merkle 計算 → metadata 構築 → tx 構築 → submit → awaitConfirmation。
   *
   * テスト容易性のため切り出し。例外は呼び元で markFailed される。
   */
  private async buildAndSubmitAndConfirm(
    ctx: IContext,
    args: {
      weeklyKey: string;
      pending: AnchorBatchPendingSet;
    },
  ): Promise<{ txHash: string; blockHeight: number | null }> {
    const { weeklyKey, pending } = args;

    // 4. Merkle root 計算 + ops 構築
    const txRoot = buildTxRoot(pending.transactionAnchors);
    const vcRoot = await this.buildVcRoot(ctx, pending.vcAnchors);
    const ops = await this.buildDidOps(ctx, pending.userDidAnchors);

    // 5. AuxiliaryData を組み立て
    const aux = buildAuxiliaryData({
      v: 1,
      bid: weeklyKey,
      ts: Math.floor(Date.now() / 1000),
      tx: txRoot,
      vc: vcRoot,
      ops,
    });

    // 6. UTXO + 鍵
    const config = resolvePlatformSignerConfig();
    const [params, utxos, currentSlot] = await Promise.all([
      this.blockfrost.getProtocolParams(),
      this.blockfrost.getUtxos(config.changeAddressBech32),
      this.slotProvider.getCurrentSlot(),
    ]);

    const signKey = resolvePlatformSignKey(config);

    const built = buildAnchorTx({
      utxos,
      params,
      signKey,
      auxiliaryData: aux,
      changeAddressBech32: config.changeAddressBech32,
      currentSlot,
    });

    // 7. submit
    const txHash = await this.blockfrost.submitTx(built.txCborBytes);
    if (txHash !== built.txHashHex) {
      logger.warn("[AnchorBatchService] submit returned hash differs from local hash", {
        local: built.txHashHex,
        remote: txHash,
      });
    }

    const ids = collectIds(pending);
    await this.repository.markSubmitted(ctx, {
      batchId: weeklyKey,
      chainTxHash: txHash,
      ...ids,
    });

    // 8. awaitConfirmation
    try {
      const tx = await this.blockfrost.awaitConfirmation(txHash, DEFAULT_CONFIRM_TIMEOUT_MS);
      await this.repository.markConfirmed(ctx, {
        batchId: weeklyKey,
        blockHeight: tx.block_height,
        ...ids,
      });
      return { txHash, blockHeight: tx.block_height };
    } catch (err) {
      // markFailed は呼び元（catch）で実施するため、ここでは throw のみ
      throw err instanceof Error ? err : new Error(`awaitConfirmation failed: ${String(err)}`);
    }
  }

  private async buildVcRoot(
    ctx: IContext,
    vcAnchors: PendingVcAnchor[],
  ): Promise<{ root: Uint8Array; count: number } | undefined> {
    if (vcAnchors.length === 0) return undefined;
    const allLeafIds = vcAnchors.flatMap((a) => a.leafIds);
    if (allLeafIds.length === 0) return undefined;
    const jwts = await this.repository.findVcJwtsByVcIssuanceRequestIds(ctx, allLeafIds);
    if (jwts.length === 0) return undefined;
    // Explicit byte-order comparator: §5.1.7 mandates canonical ASCII byte
    // ordering for Merkle determinism, which is what JS's `<`/`>` give on
    // strings (UTF-16 code-unit compare). `String.localeCompare` would
    // introduce locale-dependent collation and break cross-host hashes.
    const sorted = [...jwts]
      .map((j) => j.vcJwt)
      .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    const root = buildRoot(sorted);
    return { root, count: sorted.length };
  }

  private async buildDidOps(
    ctx: IContext,
    userDidAnchors: PendingUserDidAnchor[],
  ): Promise<DidOp[]> {
    if (userDidAnchors.length === 0) return [];
    // 「sorted by did asc」で決定論的出力にする（§5.3.1 の bid + 順序）
    const sorted = [...userDidAnchors].sort((a, b) => (a.did < b.did ? -1 : a.did > b.did ? 1 : 0));
    const prevIds = sorted
      .map((a) => a.previousAnchorId)
      .filter((id): id is string => typeof id === "string");
    const prevs = prevIds.length
      ? await this.repository.findPreviousAnchorChainTxHashes(ctx, prevIds)
      : [];
    const prevByAnchorId = new Map(prevs.map((p) => [p.id, p.chainTxHash]));

    return sorted.map((a) => buildOp(a, prevByAnchorId));
  }

  /** SUBMITTED/CONFIRMED 済 batch から chainTxHash を 1 件取得（idempotency 早期 return 用）。 */
  private async firstChainTxHashOf(ctx: IContext, weeklyKey: string): Promise<string | null> {
    const rows = await this.repository.findExistingBatchTransactionAnchors(ctx, weeklyKey);
    for (const r of rows) {
      if (typeof r.chainTxHash === "string" && r.chainTxHash.length > 0) {
        return r.chainTxHash;
      }
    }
    return null;
  }
}

/** UserDidAnchor → DidOp 変換。 */
function buildOp(a: PendingUserDidAnchor, prevByAnchorId: Map<string, string | null>): DidOp {
  const prevHash = a.previousAnchorId ? (prevByAnchorId.get(a.previousAnchorId) ?? null) : null;

  if (a.operation === DidOperation.DEACTIVATE) {
    return {
      k: "d",
      did: a.did,
      // d は prev 必須（§5.1.6）。なければ空文字（CSL に native null が無いため）
      prev: prevHash ?? "",
    };
  }

  // CREATE / UPDATE: documentCbor は DB に保存済の CBOR bytes だが、
  // txBuilder.buildOpMap が `cborEncode(op.doc)` を呼ぶため plain object を
  // 渡す必要がある。Phase 1 では最小 doc（id のみ）を渡し、改ざん検知は
  // metadata の `h` (Blake2b-256 hash) で担保する（§5.1.6 注釈）。
  const minimalDoc: Record<string, unknown> = { id: a.did };

  return {
    k: a.operation === DidOperation.CREATE ? "c" : "u",
    did: a.did,
    h: a.documentHash,
    doc: minimalDoc,
    prev: prevHash ?? null,
  };
}

/** TransactionAnchor の leafIds を全結合して merkle root を計算。 */
function buildTxRoot(
  txAnchors: PendingTransactionAnchor[],
): { root: Uint8Array; count: number } | undefined {
  if (txAnchors.length === 0) return undefined;
  const all = txAnchors.flatMap((a) => a.leafIds);
  if (all.length === 0) return undefined;
  // §5.1.7 canonical ASCII byte order. Use an explicit code-unit
  // comparator instead of bare `.sort()` so cross-host runs hash to the
  // same Merkle root regardless of process locale.
  const sorted = [...all].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  return { root: buildRoot(sorted), count: sorted.length };
}

function collectIds(pending: AnchorBatchPendingSet): {
  transactionAnchorIds: string[];
  vcAnchorIds: string[];
  userDidAnchorIds: string[];
} {
  return {
    transactionAnchorIds: pending.transactionAnchors.map((a) => a.id),
    vcAnchorIds: pending.vcAnchors.map((a) => a.id),
    userDidAnchorIds: pending.userDidAnchors.map((a) => a.id),
  };
}

function countsFor(
  txAnchors: PendingTransactionAnchor[],
  vcAnchors: PendingVcAnchor[],
  userDidAnchors: PendingUserDidAnchor[],
): { userDid: number; vc: number; tx: number } {
  return {
    userDid: userDidAnchors.length,
    vc: vcAnchors.length,
    tx: txAnchors.length,
  };
}

/** ISO 8601 week-numbering: `YYYY-Www`（例: "2026-W19"）。 */
const WEEKLY_KEY_REGEX = /^\d{4}-W\d{2}$/;

export function isValidWeeklyKey(key: string): boolean {
  if (typeof key !== "string") return false;
  if (!WEEKLY_KEY_REGEX.test(key)) return false;
  const wk = Number.parseInt(key.slice(6, 8), 10);
  return wk >= 1 && wk <= 53;
}

/**
 * 現在日時から ISO 8601 週キー `YYYY-Www` を計算（UTC 基準）。
 *
 * ISO 8601: 木曜日を含む週がその年の第 1 週。
 */
export function computeIsoWeeklyKey(date: Date = new Date()): string {
  const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  // 木曜日 = 4 (1=月..7=日) 基準で week-numbering year を決定
  const dayOfWeek = utc.getUTCDay() === 0 ? 7 : utc.getUTCDay();
  utc.setUTCDate(utc.getUTCDate() + 4 - dayOfWeek);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((utc.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${utc.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

/** env から platform signer 設定を組み立てる（Phase 1 暫定）。 */
export function resolvePlatformSignerConfig(): PlatformSignerConfig {
  const networkRaw = process.env.CARDANO_NETWORK ?? "preprod";
  const network = networkRaw === "mainnet" ? "mainnet" : "preprod";
  const changeAddressBech32 = process.env.CARDANO_PLATFORM_ADDRESS;
  if (!changeAddressBech32) {
    throw new Error(
      "AnchorBatchService: CARDANO_PLATFORM_ADDRESS is not set. Anchor submission requires the issuer bech32 address.",
    );
  }
  return {
    privateKeyHex: process.env.CARDANO_PLATFORM_PRIVATE_KEY_HEX,
    kmsKeyResourceName: process.env.CARDANO_PLATFORM_KMS_KEY_RESOURCE_NAME,
    changeAddressBech32,
    network,
  };
}

/**
 * tx 署名に使う `CSL.PrivateKey` を取得する。
 *
 * Phase 1: `CARDANO_PLATFORM_PRIVATE_KEY_HEX` を Secret Manager から env に投入し、
 *   raw 32-byte seed として CSL に渡す。
 * Phase 2: KMS 経由で署名するように差し替え予定（KmsSigner.signEd25519）。
 */
export function resolvePlatformSignKey(config: PlatformSignerConfig): CSL.PrivateKey {
  if (!config.privateKeyHex) {
    throw new Error(
      "AnchorBatchService: CARDANO_PLATFORM_PRIVATE_KEY_HEX is not set. " +
        "Phase 1 anchor submission requires the raw seed in env (Secret Manager).",
    );
  }
  const seed = hexToBytes(config.privateKeyHex);
  if (seed.length !== 32) {
    throw new Error(
      `CARDANO_PLATFORM_PRIVATE_KEY_HEX must be 32 bytes (64 hex chars), got ${seed.length} bytes.`,
    );
  }
  // deriveCardanoKeypair で CSL.PrivateKey を取得（network は anchoring に無関係だが
  // 引数として要求されるため、config.network を渡す）。
  const kp = deriveCardanoKeypair(seed, config.network);
  return kp.cslPrivateKey;
}

function hexToBytes(h: string): Uint8Array {
  const clean = h.startsWith("0x") ? h.slice(2) : h;
  if (clean.length % 2 !== 0) {
    throw new Error(`hex string must have even length, got ${clean.length}`);
  }
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    const pair = clean.slice(i * 2, i * 2 + 2);
    if (!/^[0-9a-fA-F]{2}$/.test(pair)) {
      throw new Error(`invalid hex char at offset ${i * 2}`);
    }
    out[i] = Number.parseInt(pair, 16);
  }
  return out;
}
