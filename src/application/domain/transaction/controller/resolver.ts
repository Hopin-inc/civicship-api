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

const transactionResolver = {
  Query: {
    transactions: async (_: unknown, args: GqlQueryTransactionsArgs, ctx: IContext) => {
      const usecase = container.resolve(TransactionUseCase); // 💡遅延resolve
      return usecase.visitorBrowseTransactions(args, ctx);
    },
    transaction: async (_: unknown, args: GqlQueryTransactionArgs, ctx: IContext) => {
      const usecase = container.resolve(TransactionUseCase);
      return usecase.visitorViewTransaction(args, ctx);
    },
  },
  Mutation: {
    transactionIssueCommunityPoint: async (
      _: unknown,
      args: GqlMutationTransactionIssueCommunityPointArgs,
      ctx: IContext,
    ) => {
      const usecase = container.resolve(TransactionUseCase);
      return usecase.ownerIssueCommunityPoint(args, ctx);
    },
    transactionGrantCommunityPoint: async (
      _: unknown,
      { input }: GqlMutationTransactionGrantCommunityPointArgs,
      ctx: IContext,
    ) => {
      const usecase = container.resolve(TransactionUseCase);
      return usecase.managerGrantCommunityPoint(ctx, input);
    },
    transactionDonateSelfPoint: async (
      _: unknown,
      { input }: GqlMutationTransactionDonateSelfPointArgs,
      ctx: IContext,
    ) => {
      const usecase = container.resolve(TransactionUseCase);
      return usecase.userDonateSelfPointToAnother(ctx, input);
    },
  },
};

export default transactionResolver;
