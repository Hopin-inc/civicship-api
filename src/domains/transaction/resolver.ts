import {
  GqlQueryTransactionsArgs,
  GqlQueryTransactionArgs,
  GqlMutationTransactionIssueCommunityPointArgs,
  GqlMutationTransactionGrantCommunityPointArgs,
  GqlMutationTransactionDonateSelfPointArgs,
} from "@/types/graphql";
import TransactionUseCase from "@/domains/transaction/usecase";
import { IContext } from "@/types/server";

const transactionResolver = {
  Query: {
    transactions: async (_: unknown, args: GqlQueryTransactionsArgs, ctx: IContext) =>
      TransactionUseCase.visitorBrowseTransactions(args, ctx),
    transaction: async (_: unknown, args: GqlQueryTransactionArgs, ctx: IContext) =>
      TransactionUseCase.visitorViewTransaction(args, ctx),
  },
  Mutation: {
    transactionIssueCommunityPoint: async (
      _: unknown,
      args: GqlMutationTransactionIssueCommunityPointArgs,
      ctx: IContext,
    ) => TransactionUseCase.ownerIssueCommunityPoint(args, ctx),
    transactionGrantCommunityPoint: async (
      _: unknown,
      args: GqlMutationTransactionGrantCommunityPointArgs,
      ctx: IContext,
    ) => TransactionUseCase.managerGrantCommunityPoint(args, ctx),
    transactionDonateSelfPoint: async (
      _: unknown,
      args: GqlMutationTransactionDonateSelfPointArgs,
      ctx: IContext,
    ) => TransactionUseCase.userDonateSelfPointToAnother(args, ctx),
  },
};

export default transactionResolver;
