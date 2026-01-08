import { VerifyResponse } from "@/infrastructure/libs/point-verify/client";
import { GqlTransactionVerificationResult, GqlVerificationStatus } from "@/types/graphql";
import logger from "@/infrastructure/logging";

export default class TransactionVerificationPresenter {
  static get(result: VerifyResponse): GqlTransactionVerificationResult {
    return {
      __typename: "TransactionVerificationResult",
      txId: result.txId,
      status: (() => {
        switch (result.status) {
          case "verified":
            return GqlVerificationStatus.Verified;
          case "not_verified":
            return GqlVerificationStatus.NotVerified;
          case "pending":
            return GqlVerificationStatus.Pending;
          case "error":
            return GqlVerificationStatus.Error;
          default:
            // 未知のステータスの場合はログ出力して Error として扱う
            logger.warn(
              `[TransactionVerificationPresenter] Unknown verification status received: ${result.status}`,
            );
            return GqlVerificationStatus.Error;
        }
      })(),
      transactionHash: result.transactionHash,
      rootHash: result.rootHash,
      label: result.label,
    };
  }
}
