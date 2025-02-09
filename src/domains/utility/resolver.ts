import UtilityUseCase from "@/domains/utility/usecase";
import {
  GqlQueryUtilitiesArgs,
  GqlQueryUtilityArgs,
  GqlMutationUtilityCreateArgs,
  GqlMutationUtilityDeleteArgs,
  GqlMutationUtilityUpdateInfoArgs,
  GqlMutationUtilityUseArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";

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
};

export default utilityResolver;
