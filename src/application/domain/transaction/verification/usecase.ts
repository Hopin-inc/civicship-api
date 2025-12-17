import { injectable, inject } from "tsyringe";
import TransactionVerificationService from "./service";
import TransactionVerificationPresenter from "./presenter";
import { GqlTransactionVerificationResult } from "@/types/graphql";

@injectable()
export default class TransactionVerificationUseCase {
  constructor(
    @inject("TransactionVerificationService")
    private readonly service: TransactionVerificationService,
  ) {}

  async userVerifyTransactions(txIds: string[]): Promise<GqlTransactionVerificationResult[]> {
    const results = await this.service.verifyTransactions(txIds);
    return results.map(TransactionVerificationPresenter.get);
  }
}
