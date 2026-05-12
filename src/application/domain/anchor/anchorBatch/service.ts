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
  MAX_METADATA_TX_BYTES,
  measureMetadataSize,
  type BuildAuxiliaryDataInput,
  type DidOp,
} from "@/infrastructure/libs/cardano/txBuilder";
import { BlockfrostClient } from "@/infrastructure/libs/blockfrost/client";
import { deriveCardanoKeypair } from "@/infrastructure/libs/cardano/keygen";
import { IAnchorBatchRepository } from "@/application/domain/anchor/anchorBatch/data/interface";
import {
  AnchorBatchPendingSet,
  AnchorBatchRunResult,
  PendingUserDidAnchor,
  PendingVcAnchor,
  PendingTransactionAnchor,
} from "@/application/domain/anchor/anchorBatch/data/type";

/**
 * `awaitConfirmation` のデフォルト timeout（5 分）。
 *
 * Cloud Run の default request timeout が 300s であるため、5 分待機 +
 * tx build/submit を 1 リクエストでこなすと容易にタイムアウトする。
 * 暖定対応として:
 *   - 本 PR では Cloud Run timeout >= 600s を deploy gate とし、
 *     `docs/operations/anchor-batch-deploy-checklist.md` に運用注意を明記する。
 *   - `CARDANO_AWAIT_CONFIRM_TIMEOUT_MS` で env から override 可能とし、
 *     prd では 4min、staging では 1min 等にチューニングできるようにする。
 *
 * TODO(Phase 1.5 / Phase 2): `runWeeklyBatch` を 2 段階
 *   `submitBatch` (submit まで → SUBMITTED 永続化で即 return) と
 *   `confirmBatch` (Cloud Tasks 等で別呼び出し、awaitConfirmation のみ)
 *   に分離し、router にも 2 endpoint 追加することで fire-and-forget 化する。
 *   設計参照: docs/report/did-vc-internalization.md §5.3.1。
 */
const DEFAULT_CONFIRM_TIMEOUT_MS = 5 * 60 * 1000;

/**
 * `CARDANO_AWAIT_CONFIRM_TIMEOUT_MS` env から timeout(ms) を解決する。
 *
 * 不正値（NaN / 負数 / 非数値）は default にフォールバックする。
 * Cloud Run 側の HTTP request timeout を超える値を設定すると外側で
 * 503 になり markFailed まで到達できないため、運用ドキュメントで
 * `Cloud Run timeout > CARDANO_AWAIT_CONFIRM_TIMEOUT_MS + 60s` の
 * 余裕を持たせるよう周知する。
 */
function resolveAwaitConfirmTimeoutMs(): number {
  const raw = process.env.CARDANO_AWAIT_CONFIRM_TIMEOUT_MS;
  if (raw === undefined || raw === "") return DEFAULT_CONFIRM_TIMEOUT_MS;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    logger.warn(
      "[AnchorBatchService] invalid CARDANO_AWAIT_CONFIRM_TIMEOUT_MS; falling back to default",
      { raw, default: DEFAULT_CONFIRM_TIMEOUT_MS },
    );
    return DEFAULT_CONFIRM_TIMEOUT_MS;
  }
  return parsed;
}

/** Cardano slot を取得するための小さなインターフェース。 */
export interface BlockfrostLatestSlotProvider {
  /** 最新ブロックの slot 番号を返す。 */
  getCurrentSlot(): Promise<number>;
}

/**
 * Anchoring に必要な platform 鍵情報。env 変数から組み立てる。
 *
 * - `CARDANO_PLATFORM_PRIVATE_KEY_HEX`: 32-byte ed25519 seed の hex (raw)。
 *   KMS 経由で署名する Phase 2 までの暖定。Phase 1 では env から直接読む
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
  /** 設定（platform 鍵 / KMS resource）。 */
  signerConfig: PlatformSignerConfig;
  /** confirmation 待機 timeout (ms)。テスト時短縮用。 */
  confirmTimeoutMs?: number;
}

@injectable()
export class AnchorBatchService {
  /**
   * Phase 1 では env 上の raw seed (`CARDANO_PLATFORM_PRIVATE_KEY_HEX`) で
   * 直接署名する。
   *
   * TODO(Phase 2): KMS 経由署名（vkey witness 手動 attach）を導入する PR で
   *   `KmsSigner` を改めて `@inject("KmsSigner")` する。本 PR では実際に
   *   利用しないため inject せず、DI 設計負債（`void this._signer` の
   *   握りつぶし）を残さない方針とする。
   *   設計参照: docs/report/did-vc-internalization.md §5.1.6 / §5.3.1。
   */
  constructor(
    @inject("AnchorBatchRepository")
    private readonly repository: IAnchorBatchRepository,
    @inject("BlockfrostClient")
    private readonly blockfrost: BlockfrostClient,
    @inject("BlockfrostLatestSlotProvider")
    private readonly slotProvider: BlockfrostLatestSlotProvider,
  ) {}

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
    const rawOps = await this.buildDidOps(ctx, pending.userDidAnchors);

    // 5. AuxiliaryData を組み立てる（§8.4 size budget — documentCbor を含めると
    //    16 KB を超える場合は末尾の op から順次 docCbor を脱落させる）
    const baseInput: Omit<BuildAuxiliaryDataInput, "ops"> = {
      v: 1,
      bid: weeklyKey,
      ts: Math.floor(Date.now() / 1000),
      tx: txRoot,
      vc: vcRoot,
    };
    const ops = trimDocCborForSizeBudget(baseInput, rawOps);
    const aux = buildAuxiliaryData({ ...baseInput, ops });

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
      const tx = await this.blockfrost.awaitConfirmation(txHash, resolveAwaitConfirmTimeoutMs());
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
    const sorted = [...jwts].map((j) => j.vcJwt).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
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

/** UserDidAnchor → DidOp 変換（§8 / §8.3 — chain inclusion）。 */
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

  // CREATE / UPDATE: §8.3 / §8.4 に従い documentCbor を chain metadata に
  // 同梱して chain 単独で DID Document を再構築可能にする（Phase 2）。
  // documentCbor は DB に保存済の Bytes 列を **そのまま** 渡し、txBuilder
  // 側でも再 encode しない。これにより `documentHash` (Blake2b-256) が
  // chain 上の bytes と一致することが保証される。
  //
  // documentCbor が NULL の場合は Phase 1 の最小 doc（{ id }）に fallback。
  // 主に Phase 3 backfill 行や、§U の "size 超過時に NULL 保存" を想定。
  const docCbor = normalizeDocumentCbor(a.documentCbor);
  if (docCbor) {
    return {
      k: a.operation === DidOperation.CREATE ? "c" : "u",
      did: a.did,
      h: a.documentHash,
      docCbor,
      prev: prevHash ?? null,
    };
  }
  return {
    k: a.operation === DidOperation.CREATE ? "c" : "u",
    did: a.did,
    h: a.documentHash,
    doc: { id: a.did },
    prev: prevHash ?? null,
  };
}

/**
 * Normalize `documentCbor` from Prisma (Buffer | Uint8Array | null) to a
 * plain Uint8Array, or undefined when the row has no CBOR blob persisted.
 *
 * Prisma's `Bytes` field is typed as `Buffer` in @prisma/client; tests pass
 * Uint8Array directly. `Buffer` is a subclass of `Uint8Array`, so
 * `instanceof Uint8Array` would short-circuit to the Buffer branch and
 * the chunker's `.subarray()` would inherit Buffer-flavoured semantics
 * (which return Buffer slices, not plain Uint8Array). Compare
 * constructors directly so Buffer is always copied into a plain
 * Uint8Array and downstream behaviour is uniform.
 */
function normalizeDocumentCbor(
  blob: Buffer | Uint8Array | null | undefined,
): Uint8Array | undefined {
  if (!blob) return undefined;
  if (blob.length === 0) return undefined;
  return blob.constructor === Uint8Array ? (blob as Uint8Array) : new Uint8Array(blob);
}

/**
 * §8.4 size-budget enforcement.
 *
 * `documentCbor` を全 op に同梱した状態で AuxiliaryData CBOR size が
 * `MAX_METADATA_TX_BYTES` (16 KB) を超えた場合、末尾の c/u op から順に
 * `docCbor` を取り外し、最小 doc に置換することで超過分を吸収する。
 * Phase 2 では分割 tx ではなくシンプルなフォールバックで対応する
 * （複数 tx 分割は Phase 4 でルーター層に持たせる予定）。
 *
 * 取り外す順序: anchor は did 昇順で sort 済 (§5.3.1) なので、末尾から
 * 削っても順序の決定性は維持される（同入力 → 同 metadata bytes）。
 *
 * Implementation note (Gemini review): replace the per-iteration spread
 * `[...candidate.slice(0, idx), replaced, ...candidate.slice(idx + 1)]`
 * with an in-place mutation of a single working copy. We still call
 * `measureMetadataSize` once per trimmed op (it has to rebuild the
 * AuxiliaryData to know the new size), but the surrounding array work
 * drops from O(N²) memory traffic to O(1) per iteration.
 *
 * Returns the (possibly mutated) ops array — original `ops` is not
 * touched (we copy it once up front).
 */
export function trimDocCborForSizeBudget(
  base: Omit<BuildAuxiliaryDataInput, "ops">,
  ops: DidOp[],
): DidOp[] {
  let size = measureMetadataSize({ ...base, ops });
  if (size <= MAX_METADATA_TX_BYTES) return ops;

  // Single working copy: mutated in place during trim.
  const candidate: DidOp[] = [...ops];

  // Find c/u ops with docCbor; DEACTIVATE ops carry no doc so they're skipped.
  const trimmableIndexes: number[] = [];
  for (let i = 0; i < candidate.length; i++) {
    const op = candidate[i];
    if (op.k !== "d" && op.docCbor !== undefined) {
      trimmableIndexes.push(i);
    }
  }

  // Trim from the tail (highest did) so earlier ops keep their CBOR.
  for (let i = trimmableIndexes.length - 1; i >= 0; i--) {
    const idx = trimmableIndexes[i];
    const op = candidate[idx];
    if (op.k === "d") continue; // type guard for narrowing
    candidate[idx] = {
      k: op.k,
      did: op.did,
      h: op.h,
      doc: { id: op.did },
      prev: op.prev ?? null,
    };
    size = measureMetadataSize({ ...base, ops: candidate });
    logger.warn(
      "[AnchorBatchService] documentCbor dropped for size budget (§8.4)",
      { did: op.did, remainingBytes: MAX_METADATA_TX_BYTES - size },
    );
    if (size <= MAX_METADATA_TX_BYTES) return candidate;
  }

  // Even with all docCbor dropped we still exceed 16 KB → let txBuilder
  // throw the precise error, the caller's markFailed will surface it.
  return candidate;
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

/** env から platform signer 設定を組み立てる（Phase 1 暖定）。 */
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
    // length チェックで弾く前にも seed bytes を握っているため、確実に zeroize する。
    seed.fill(0);
    throw new Error(
      `CARDANO_PLATFORM_PRIVATE_KEY_HEX must be 32 bytes (64 hex chars), got ${seed.length} bytes.`,
    );
  }
  try {
    // deriveCardanoKeypair で CSL.PrivateKey を取得（network は anchoring に無関係だが
    // 引数として要求されるため、config.network を渡す）。CSL.PrivateKey は seed bytes を
    // 内部的にコピーするため、ここで zeroize しても署名は影響を受けない。
    const kp = deriveCardanoKeypair(seed, config.network);
    return kp.cslPrivateKey;
  } finally {
    // CSL に渡した直後にプロセス上から seed の痕跡を消す（メモリダンプ対策）。
    seed.fill(0);
  }
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
