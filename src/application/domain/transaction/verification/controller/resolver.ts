import { GqlQueryVerifyTransactionsArgs, GqlTransactionVerificationResult } from "@/types/graphql";
import { inject, injectable } from "tsyringe";
import TransactionVerificationUseCase from "@/application/domain/transaction/verification/usecase";
import { IContext } from "@/types/server";

@injectable()
export default class TransactionVerificationResolver {
  constructor(
    @inject("TransactionVerificationUseCase")
    private readonly useCase: TransactionVerificationUseCase,
  ) {}

  Query = {
    verifyTransactions: async (
      _: unknown,
      { txIds }: GqlQueryVerifyTransactionsArgs,
      ctx: IContext,
    ): Promise<GqlTransactionVerificationResult[]> => {
      return this.useCase.userVerifyTransactions(txIds, ctx);
    },
  };
}
