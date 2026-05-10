/**
 * AnchorBatchPresenter.
 *
 * runWeeklyBatch の結果を REST レスポンス用 DTO に変換する pure function。
 */

import { AnchorBatchRunResult } from "@/application/domain/anchor/anchorBatch/data/type";

export interface AnchorBatchHttpResponse {
  batchId: string;
  submitted: boolean;
  txHash: string | null;
  status: string;
  anchorCounts: {
    userDid: number;
    vc: number;
    tx: number;
  };
  failureReason?: string;
}

export default class AnchorBatchPresenter {
  static toHttpResponse(result: AnchorBatchRunResult): AnchorBatchHttpResponse {
    return {
      batchId: result.batchId,
      submitted: result.submitted,
      txHash: result.txHash,
      status: result.status,
      anchorCounts: result.anchorCounts,
      ...(result.failureReason ? { failureReason: result.failureReason } : {}),
    };
  }
}
