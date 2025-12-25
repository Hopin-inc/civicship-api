import { VerifyResponse } from "@/infrastructure/libs/point-verify/client";
import { GqlTransactionVerificationResult, GqlVerificationStatus } from "@/types/graphql";

export default class TransactionVerificationPresenter {
  static get(result: VerifyResponse): GqlTransactionVerificationResult {
    return {
      __typename: "TransactionVerificationResult",
      txId: result.txId,
      status:
        result.status === "verified"
          ? GqlVerificationStatus.Verified
          : GqlVerificationStatus.NotVerified,
      transactionHash: result.transactionHash,
      rootHash: result.rootHash,
      label: result.label,
    };
  }
}
