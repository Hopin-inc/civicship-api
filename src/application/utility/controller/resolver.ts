import UtilityUseCase from "@/application/utility/usecase";
import {
  GqlQueryUtilitiesArgs,
  GqlQueryUtilityArgs,
  GqlMutationUtilityCreateArgs,
  GqlMutationUtilityDeleteArgs,
  GqlMutationUtilityUpdateInfoArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";

const utilityResolver = {
  Query: {
    utilities: async (_: unknown, args: GqlQueryUtilitiesArgs, ctx: IContext) =>
      UtilityUseCase.visitorBrowseUtilities(ctx, args),

    utility: async (_: unknown, args: GqlQueryUtilityArgs, ctx: IContext) => {
      if (!ctx.loaders?.utility) {
        return UtilityUseCase.visitorViewUtility(ctx, args);
      }
      return await ctx.loaders.utility.load(args.id);
    },
  },
  Mutation: {
    utilityCreate: async (_: unknown, args: GqlMutationUtilityCreateArgs, ctx: IContext) =>
      UtilityUseCase.managerCreateUtility(ctx, args),
    utilityDelete: async (_: unknown, args: GqlMutationUtilityDeleteArgs, ctx: IContext) =>
      UtilityUseCase.managerDeleteUtility(ctx, args),
    utilityUpdateInfo: async (_: unknown, args: GqlMutationUtilityUpdateInfoArgs, ctx: IContext) =>
      UtilityUseCase.managerUpdateUtilityInfo(ctx, args),
  },
};

export default utilityResolver;
