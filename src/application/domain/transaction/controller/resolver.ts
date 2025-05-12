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
import { PrismaTransactionDetail } from "@/application/domain/transaction/data/type";

@injectable()
export default class TransactionResolver {
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

  Transaction = {
    fromWallet: (parent: PrismaTransactionDetail, _: unknown, ctx: IContext) => {
      return parent.from ? ctx.loaders.wallet.load(parent.from) : null;
    },

    toWallet: (parent: PrismaTransactionDetail, _: unknown, ctx: IContext) => {
      return parent.to ? ctx.loaders.wallet.load(parent.to) : null;
    },

    participation: (parent: PrismaTransactionDetail, _: unknown, ctx: IContext) => {
      return parent.participationId ? ctx.loaders.participation.load(parent.participationId) : null;
    },

    ticketStatusHistories: (parent: PrismaTransactionDetail, _: unknown, ctx: IContext) => {
      return ctx.loaders.ticketStatusHistoriesByTransaction.load(parent.id);
    },
  };
}
