import {
  GqlQueryTransactionsArgs,
  GqlQueryTransactionArgs,
  GqlMutationTransactionIssueCommunityPointArgs,
  GqlMutationTransactionGrantCommunityPointArgs,
  GqlMutationTransactionDonateSelfPointArgs,
} from "@/types/graphql";
import TransactionReadUseCase from "@/application/transaction/usecase/read";
import { IContext } from "@/types/server";
import TransactionWriteUseCase from "@/application/transaction/usecase/write";

const transactionResolver = {
  Query: {
    transactions: async (_: unknown, args: GqlQueryTransactionsArgs, ctx: IContext) =>
      TransactionReadUseCase.visitorBrowseTransactions(args, ctx),
    transaction: async (_: unknown, args: GqlQueryTransactionArgs, ctx: IContext) => {
      if (!ctx.loaders?.transaction) {
        return TransactionReadUseCase.visitorViewTransaction(args, ctx);
      }
      return await ctx.loaders.transaction.load(args.id);
    },
  },
  Mutation: {
    transactionIssueCommunityPoint: async (
      _: unknown,
      args: GqlMutationTransactionIssueCommunityPointArgs,
      ctx: IContext,
    ) => TransactionWriteUseCase.ownerIssueCommunityPoint(args, ctx),
    transactionGrantCommunityPoint: async (
      _: unknown,
      { input }: GqlMutationTransactionGrantCommunityPointArgs,
      ctx: IContext,
    ) => TransactionWriteUseCase.managerGrantCommunityPoint(ctx, input),
    transactionDonateSelfPoint: async (
      _: unknown,
      { input }: GqlMutationTransactionDonateSelfPointArgs,
      ctx: IContext,
    ) => TransactionWriteUseCase.userDonateSelfPointToAnother(ctx, input),
  },
};

export default transactionResolver;
