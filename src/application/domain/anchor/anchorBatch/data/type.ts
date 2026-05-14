/**
 * AnchorBatch 用の Prisma row 型定義。
 *
 * 設計参照:
 *   docs/report/did-vc-internalization.md §5.2.3 (anchor ドメイン)
 *   docs/report/did-vc-internalization.md §5.3.1 (週次バッチ)
 */

import {
  AnchorStatus,
  ChainNetwork,
  DidOperation,
  TransactionAnchor,
  UserDidAnchor,
  VcAnchor,
} from "@prisma/client";

/** PENDING な TransactionAnchor 行（必要列のみ）。 */
export type PendingTransactionAnchor = Pick<
  TransactionAnchor,
  | "id"
  | "leafIds"
  | "leafCount"
  | "rootHash"
  | "network"
  | "status"
  | "batchId"
  | "chainTxHash"
  | "periodStart"
  | "periodEnd"
>;

/** PENDING な VcAnchor 行（必要列のみ）。 */
export type PendingVcAnchor = Pick<
  VcAnchor,
  | "id"
  | "leafIds"
  | "leafCount"
  | "rootHash"
  | "network"
  | "status"
  | "batchId"
  | "periodStart"
  | "periodEnd"
>;

/** PENDING な UserDidAnchor 行（必要列のみ）。 */
export type PendingUserDidAnchor = Pick<
  UserDidAnchor,
  | "id"
  | "did"
  | "operation"
  | "documentHash"
  | "documentCbor"
  | "previousAnchorId"
  | "network"
  | "status"
  | "batchId"
  | "userId"
>;

/** VC JWT を leaf として merkle root を計算するために必要な最小情報。 */
export interface VcJwtLeaf {
  /** VcIssuanceRequest.id（DB 側 leafId）。 */
  vcIssuanceRequestId: string;
  /** vcJwt 本体（merkle leaf hash 入力）。 */
  vcJwt: string;
}

/** UserDidAnchor の前 anchor の chainTxHash 取得用。 */
export interface PreviousAnchorChainTx {
  id: string;
  chainTxHash: string | null;
}

export interface AnchorBatchPendingSet {
  transactionAnchors: PendingTransactionAnchor[];
  vcAnchors: PendingVcAnchor[];
  userDidAnchors: PendingUserDidAnchor[];
}

/** runWeeklyBatch の出力。 */
export interface AnchorBatchRunResult {
  batchId: string;
  submitted: boolean;
  txHash: string | null;
  anchorCounts: {
    userDid: number;
    vc: number;
    tx: number;
  };
  status: AnchorStatus;
  failureReason?: string;
}

export type { AnchorStatus, ChainNetwork, DidOperation };
