import {
  GqlQueryTransactionsArgs,
  GqlQueryTransactionArgs,
  GqlMutationTransactionIssueCommunityPointArgs,
  GqlMutationTransactionGrantCommunityPointArgs,
  GqlMutationTransactionDonateSelfPointArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import { inject, injectable } from "tsyringe";
import TransactionUseCase from "@/application/domain/transaction/usecase";

@injectable()
export class TransactionResolver {
  constructor(@inject("TransactionUseCase") private readonly useCase: TransactionUseCase) {}

  Query = {
    transactions: async (_: unknown, args: GqlQueryTransactionsArgs, ctx: IContext) => {
      return this.useCase.visitorBrowseTransactions(args, ctx);
    },
    transaction: async (_: unknown, args: GqlQueryTransactionArgs, ctx: IContext) => {
      return this.useCase.visitorViewTransaction(args, ctx);
    },
  };

  Mutation = {
    transactionIssueCommunityPoint: async (
      _: unknown,
      args: GqlMutationTransactionIssueCommunityPointArgs,
      ctx: IContext,
    ) => {
      return this.useCase.ownerIssueCommunityPoint(args, ctx);
    },
    transactionGrantCommunityPoint: async (
      _: unknown,
      { input }: GqlMutationTransactionGrantCommunityPointArgs,
      ctx: IContext,
    ) => {
      return this.useCase.ownerGrantCommunityPoint(ctx, input);
    },
    transactionDonateSelfPoint: async (
      _: unknown,
      { input }: GqlMutationTransactionDonateSelfPointArgs,
      ctx: IContext,
    ) => {
      return this.useCase.userDonateSelfPointToAnother(ctx, input);
    },
  };
}
