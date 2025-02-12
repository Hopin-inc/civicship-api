import UtilityUseCase from "@/domains/utility/usecase";
import {
  GqlQueryUtilitiesArgs,
  GqlQueryUtilityArgs,
  GqlMutationUtilityCreateArgs,
  GqlMutationUtilityDeleteArgs,
  GqlMutationUtilityUpdateInfoArgs,
  GqlMutationUtilityUseArgs,
  GqlUtility,
  GqlUtilityTransactionsArgs,
  GqlTransactionsConnection,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import TransactionUseCase from "@/domains/transaction/usecase";

const utilityResolver = {
  Query: {
    utilities: async (_: unknown, args: GqlQueryUtilitiesArgs, ctx: IContext) =>
      UtilityUseCase.visitorBrowseUtilities(ctx, args),

    utility: async (_: unknown, args: GqlQueryUtilityArgs, ctx: IContext) =>
      UtilityUseCase.visitorViewUtility(ctx, args),
  },
  Mutation: {
    utilityCreate: async (_: unknown, args: GqlMutationUtilityCreateArgs, ctx: IContext) =>
      UtilityUseCase.managerCreateUtility(ctx, args),
    utilityDelete: async (_: unknown, args: GqlMutationUtilityDeleteArgs, ctx: IContext) =>
      UtilityUseCase.managerDeleteUtility(ctx, args),
    utilityUpdateInfo: async (_: unknown, args: GqlMutationUtilityUpdateInfoArgs, ctx: IContext) =>
      UtilityUseCase.managerUpdateUtilityInfo(ctx, args),
    utilityUse: async (_: unknown, args: GqlMutationUtilityUseArgs, ctx: IContext) =>
      UtilityUseCase.memberUseUtility(ctx, args),
  },

  Utility: {
    transactions: async (
      parent: GqlUtility,
      args: GqlUtilityTransactionsArgs,
      ctx: IContext,
    ): Promise<GqlTransactionsConnection> => {
      return TransactionUseCase.visitorBrowseTransactionsByUtility(parent, args, ctx);
    },
  },
};

export default utilityResolver;
