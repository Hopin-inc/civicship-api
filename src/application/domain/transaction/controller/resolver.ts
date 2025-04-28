import {
  GqlQueryTransactionsArgs,
  GqlQueryTransactionArgs,
  GqlMutationTransactionIssueCommunityPointArgs,
  GqlMutationTransactionGrantCommunityPointArgs,
  GqlMutationTransactionDonateSelfPointArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import { container } from "tsyringe";
import TransactionUseCase from "@/application/domain/transaction/usecase";

const transactionUseCase = container.resolve(TransactionUseCase);

const transactionResolver = {
  Query: {
    transactions: async (_: unknown, args: GqlQueryTransactionsArgs, ctx: IContext) =>
      transactionUseCase.visitorBrowseTransactions(args, ctx),
    transaction: async (_: unknown, args: GqlQueryTransactionArgs, ctx: IContext) => {
      return transactionUseCase.visitorViewTransaction(args, ctx);
    },
  },
  Mutation: {
    transactionIssueCommunityPoint: async (
      _: unknown,
      args: GqlMutationTransactionIssueCommunityPointArgs,
      ctx: IContext,
    ) => transactionUseCase.ownerIssueCommunityPoint(args, ctx),
    transactionGrantCommunityPoint: async (
      _: unknown,
      { input }: GqlMutationTransactionGrantCommunityPointArgs,
      ctx: IContext,
    ) => transactionUseCase.managerGrantCommunityPoint(ctx, input),
    transactionDonateSelfPoint: async (
      _: unknown,
      { input }: GqlMutationTransactionDonateSelfPointArgs,
      ctx: IContext,
    ) => transactionUseCase.userDonateSelfPointToAnother(ctx, input),
  },
};

export default transactionResolver;
