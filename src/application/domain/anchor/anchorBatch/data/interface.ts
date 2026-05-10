/**
 * AnchorBatch repository インターフェース。
 *
 * 設計参照:
 *   docs/report/did-vc-internalization.md §5.2.3 (repository.ts)
 *   docs/report/did-vc-internalization.md §5.3.1 (idempotency / CAS)
 */

import { AnchorStatus } from "@prisma/client";
import { IContext } from "@/types/server";
import {
  AnchorBatchPendingSet,
  PendingTransactionAnchor,
  PendingUserDidAnchor,
  PendingVcAnchor,
  PreviousAnchorChainTx,
  VcJwtLeaf,
} from "@/application/domain/anchor/anchorBatch/data/type";

/**
 * AnchorBatch の repository interface。
 *
 * idempotency の責務:
 *   - `findExistingBatch(batchId)`: 同じ weeklyKey で submit 済 batch があるか確認
 *   - `claimPending(...)`: PENDING + batchId IS NULL の行に対して CAS で batchId を埋め込む
 *     （二重 submit 防止）
 *   - `markSubmitted(...)`: tx submit 直後の状態遷移
 *   - `markConfirmed(...)`: confirmation 後の終端遷移
 *   - `markFailed(...)`: timeout / submit エラー時の終端遷移
 */
export interface IAnchorBatchRepository {
  /**
   * 既存の同 batchId（= weeklyKey）の TransactionAnchor 行を返す。
   * idempotency: 同 weeklyKey で既に SUBMITTED / CONFIRMED な batch があれば早期 return。
   */
  findExistingBatchTransactionAnchors(
    ctx: IContext,
    batchId: string,
  ): Promise<PendingTransactionAnchor[]>;

  /** PENDING + batchId IS NULL な anchor 行を全件取得（型別に分けて返す）。 */
  findPendingAnchors(ctx: IContext): Promise<AnchorBatchPendingSet>;

  /** vcIssuanceRequestId のリストから vcJwt を取得（merkle root 入力）。 */
  findVcJwtsByVcIssuanceRequestIds(
    ctx: IContext,
    vcIssuanceRequestIds: string[],
  ): Promise<VcJwtLeaf[]>;

  /** UserDidAnchor.previousAnchorId から chainTxHash を取得（ops.prev 構築用）。 */
  findPreviousAnchorChainTxHashes(
    ctx: IContext,
    previousAnchorIds: string[],
  ): Promise<PreviousAnchorChainTx[]>;

  /**
   * `status = PENDING AND batchId IS NULL` な anchor 群に対して `batchId` を CAS で
   * 書き込む。同時に並行 batch が走った場合に 2 つ目はここで 0 件 update を観測する。
   */
  claimPendingAnchors(
    ctx: IContext,
    args: {
      batchId: string;
      transactionAnchorIds: string[];
      vcAnchorIds: string[];
      userDidAnchorIds: string[];
    },
  ): Promise<{
    transactionAnchors: number;
    vcAnchors: number;
    userDidAnchors: number;
  }>;

  /** 全 anchor 行を SUBMITTED 状態に遷移し、chainTxHash を埋める。 */
  markSubmitted(
    ctx: IContext,
    args: {
      batchId: string;
      chainTxHash: string;
      transactionAnchorIds: string[];
      vcAnchorIds: string[];
      userDidAnchorIds: string[];
    },
  ): Promise<void>;

  /** 全 anchor 行を CONFIRMED に遷移。 */
  markConfirmed(
    ctx: IContext,
    args: {
      batchId: string;
      blockHeight: number | null;
      transactionAnchorIds: string[];
      vcAnchorIds: string[];
      userDidAnchorIds: string[];
    },
  ): Promise<void>;

  /** 全 anchor 行を FAILED に遷移し、failureReason を残す。 */
  markFailed(
    ctx: IContext,
    args: {
      batchId: string;
      failureReason: string;
      transactionAnchorIds: string[];
      vcAnchorIds: string[];
      userDidAnchorIds: string[];
    },
  ): Promise<void>;

  /** 既存 batch の終端ステータス（idempotency 早期 return 判定用）。 */
  getBatchTerminalStatus(ctx: IContext, batchId: string): Promise<AnchorStatus | null>;

  /** 任意：batchId に紐づく PENDING な VcAnchor を返す（resume パス用、未使用でも interface に含める）。 */
  findPendingVcAnchorsByBatchId?(ctx: IContext, batchId: string): Promise<PendingVcAnchor[]>;

  /** 任意：batchId に紐づく PENDING な UserDidAnchor を返す（resume パス用）。 */
  findPendingUserDidAnchorsByBatchId?(
    ctx: IContext,
    batchId: string,
  ): Promise<PendingUserDidAnchor[]>;
}
