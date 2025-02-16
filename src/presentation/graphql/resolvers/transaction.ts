import {
  GqlQueryTransactionsArgs,
  GqlQueryTransactionArgs,
  GqlMutationTransactionIssueCommunityPointArgs,
  GqlMutationTransactionGrantCommunityPointArgs,
  GqlMutationTransactionDonateSelfPointArgs,
  GqlUtilityHistoriesConnection,
  GqlTransaction,
  GqlTransactionUtilityHistoriesArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import TransactionUseCase from "@/app/transaction/usecase";
import UtilityHistoryUseCase from "@/app/utility/history/usecase";

const transactionResolver = {
  Query: {
    transactions: async (_: unknown, args: GqlQueryTransactionsArgs, ctx: IContext) =>
      TransactionUseCase.visitorBrowseTransactions(args, ctx),
    transaction: async (_: unknown, args: GqlQueryTransactionArgs, ctx: IContext) => {
      if (!ctx.loaders?.transaction) {
        return TransactionUseCase.visitorViewTransaction(args, ctx);
      }
      return await ctx.loaders.transaction.load(args.id);
    },
  },
  Mutation: {
    transactionIssueCommunityPoint: async (
      _: unknown,
      args: GqlMutationTransactionIssueCommunityPointArgs,
      ctx: IContext,
    ) => TransactionUseCase.ownerIssueCommunityPoint(args, ctx),
    transactionGrantCommunityPoint: async (
      _: unknown,
      { input }: GqlMutationTransactionGrantCommunityPointArgs,
      ctx: IContext,
    ) => TransactionUseCase.managerGrantCommunityPoint(ctx, input),
    transactionDonateSelfPoint: async (
      _: unknown,
      { input }: GqlMutationTransactionDonateSelfPointArgs,
      ctx: IContext,
    ) => TransactionUseCase.userDonateSelfPointToAnother(ctx, input),
  },

  Transaction: {
    utilityHistories: async (
      parent: GqlTransaction,
      args: GqlTransactionUtilityHistoriesArgs,
      ctx: IContext,
    ): Promise<GqlUtilityHistoriesConnection> => {
      return UtilityHistoryUseCase.visitorBrowseUtilityHistoriesByTransaction(parent, args, ctx);
    },
  },
};

export default transactionResolver;
