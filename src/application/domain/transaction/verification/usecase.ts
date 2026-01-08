import { injectable, inject } from "tsyringe";
import TransactionVerificationService from "./service";
import TransactionVerificationPresenter from "./presenter";
import { GqlTransactionVerificationResult } from "@/types/graphql";
import { IContext } from "@/types/server";

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
    // 空配列チェック
    if (txIds.length === 0) {
      return [];
    }

    // 最大件数制限（100件）
    const MAX_TX_IDS = 100;
    if (txIds.length > MAX_TX_IDS) {
      throw new Error(`一度に検証できるトランザクションは${MAX_TX_IDS}件までです。`);
    }

    const results = await this.service.verifyTransactions(txIds);
    return results.map(TransactionVerificationPresenter.get);
  }
}
