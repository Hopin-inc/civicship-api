import { injectable, inject } from "tsyringe";
import TransactionVerificationService from "./service";
import TransactionVerificationPresenter from "./presenter";
import { GqlTransactionVerificationResult } from "@/types/graphql";
import { IContext } from "@/types/server";
import logger from "@/infrastructure/logging";

@injectable()
export default class TransactionVerificationUseCase {
  constructor(
    @inject("TransactionVerificationService")
    private readonly service: TransactionVerificationService,
  ) {}

  async userVerifyTransactions(
    txIds: string[],
    ctx: IContext,
  ): Promise<GqlTransactionVerificationResult[]> {
    // 監査ログ
    logger.info("[TransactionVerification] userVerifyTransactions called", {
      userId: ctx.currentUser?.id,
      txIdsCount: txIds.length,
    });

    // 空配列チェック
    if (txIds.length === 0) {
      return [];
    }

    // 最大件数制限（100件）
    const MAX_TX_IDS = 100;
    if (txIds.length > MAX_TX_IDS) {
      throw new Error(`Transaction verification is limited to ${MAX_TX_IDS} transactions per request.`);
    }

    const results = await this.service.verifyTransactions(txIds);
    return results.map(TransactionVerificationPresenter.get);
  }
}
