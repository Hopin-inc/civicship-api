import {
  GqlQueryTransactionsArgs,
  GqlQueryTransactionArgs,
  GqlQuerySignupBonusesArgs,
  GqlMutationTransactionIssueCommunityPointArgs,
  GqlMutationTransactionGrantCommunityPointArgs,
  GqlMutationTransactionDonateSelfPointArgs,
  GqlMutationRetrySignupBonusGrantArgs,
  GqlMutationSignupBonusRetryArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import { inject, injectable } from "tsyringe";
import TransactionUseCase from "@/application/domain/transaction/usecase";
import { PrismaTransactionDetail } from "@/application/domain/transaction/data/type";
import { PrismaIncentiveGrantDetail } from "@/application/domain/transaction/incentiveGrant/data/type";

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
    signupBonuses: async (_: unknown, args: GqlQuerySignupBonusesArgs, ctx: IContext) => {
      return this.useCase.managerGetSignupBonuses(args, ctx);
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
      args: GqlMutationTransactionGrantCommunityPointArgs,
      ctx: IContext,
    ) => {
      return this.useCase.ownerGrantCommunityPoint(ctx, args);
    },
    transactionDonateSelfPoint: async (
      _: unknown,
      args: GqlMutationTransactionDonateSelfPointArgs,
      ctx: IContext,
    ) => {
      return this.useCase.userDonateSelfPointToAnother(ctx, args);
    },
    retrySignupBonusGrant: async (
      _: unknown,
      args: GqlMutationRetrySignupBonusGrantArgs,
      ctx: IContext,
    ) => {
      return this.useCase.managerRetrySignupBonusGrant(args, ctx);
    },
    signupBonusRetry: async (
      _: unknown,
      args: GqlMutationSignupBonusRetryArgs,
      ctx: IContext,
    ) => {
      return this.useCase.managerRetrySignupBonus(args, ctx);
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

  SignupBonus = {
    user: (parent: PrismaIncentiveGrantDetail, _: unknown, ctx: IContext) =>
      ctx.loaders.user.load(parent.userId),
    community: (parent: PrismaIncentiveGrantDetail, _: unknown, ctx: IContext) =>
      ctx.loaders.community.load(parent.communityId),
    transaction: (parent: PrismaIncentiveGrantDetail, _: unknown, ctx: IContext) =>
      parent.transactionId ? ctx.loaders.transaction.load(parent.transactionId) : null,
  };
}
