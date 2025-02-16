import UtilityReadUseCase from "@/application/utility/usecase/read";
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
import TransactionReadUseCase from "@/application/transaction/usecase/read";
import UtilityWriteUseCase from "@/application/utility/usecase/write";

const utilityResolver = {
  Query: {
    utilities: async (_: unknown, args: GqlQueryUtilitiesArgs, ctx: IContext) =>
      UtilityReadUseCase.visitorBrowseUtilities(ctx, args),

    utility: async (_: unknown, args: GqlQueryUtilityArgs, ctx: IContext) => {
      if (!ctx.loaders?.utility) {
        return UtilityReadUseCase.visitorViewUtility(ctx, args);
      }
      return await ctx.loaders.utility.load(args.id);
    },
  },
  Mutation: {
    utilityCreate: async (_: unknown, args: GqlMutationUtilityCreateArgs, ctx: IContext) =>
      UtilityWriteUseCase.managerCreateUtility(ctx, args),
    utilityDelete: async (_: unknown, args: GqlMutationUtilityDeleteArgs, ctx: IContext) =>
      UtilityWriteUseCase.managerDeleteUtility(ctx, args),
    utilityUpdateInfo: async (_: unknown, args: GqlMutationUtilityUpdateInfoArgs, ctx: IContext) =>
      UtilityWriteUseCase.managerUpdateUtilityInfo(ctx, args),
    utilityUse: async (_: unknown, args: GqlMutationUtilityUseArgs, ctx: IContext) =>
      UtilityWriteUseCase.memberUseUtility(ctx, args),
  },

  Utility: {
    transactions: async (
      parent: GqlUtility,
      args: GqlUtilityTransactionsArgs,
      ctx: IContext,
    ): Promise<GqlTransactionsConnection> => {
      return TransactionReadUseCase.visitorBrowseTransactionsByUtility(parent, args, ctx);
    },
  },
};

export default utilityResolver;
