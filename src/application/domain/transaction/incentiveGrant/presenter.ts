import { GqlSignupBonusRetryPayload } from "@/types/graphql";
import { PrismaTransactionDetail } from "@/application/domain/transaction/data/type";
import TransactionPresenter from "@/application/domain/transaction/presenter";

export default class IncentiveGrantPresenter {
  /**
   * SignupBonusRetryPayload（成功時）を生成する。
   */
  static signupBonusRetrySuccess(
    transaction: PrismaTransactionDetail | undefined,
  ): GqlSignupBonusRetryPayload {
    return {
      __typename: "SignupBonusRetryPayload",
      success: true,
      transaction: TransactionPresenter.getOrNull(transaction),
      error: null,
    };
  }

  /**
   * SignupBonusRetryPayload（失敗時）を生成する。
   */
  static signupBonusRetryError(error: string): GqlSignupBonusRetryPayload {
    return {
      __typename: "SignupBonusRetryPayload",
      success: false,
      transaction: null,
      error,
    };
  }
}
