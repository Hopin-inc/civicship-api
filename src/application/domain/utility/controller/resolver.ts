import UtilityUseCase from "@/application/domain/utility/usecase";
import {
  GqlQueryUtilitiesArgs,
  GqlQueryUtilityArgs,
  GqlMutationUtilityCreateArgs,
  GqlMutationUtilityDeleteArgs,
  GqlMutationUtilityUpdateInfoArgs,
  GqlUtility,
  GqlUtilityTicketsArgs,
  GqlUtilityRequiredForOpportunitiesArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import TicketUseCase from "@/application/domain/ticket/usecase";
import OpportunityUseCase from "@/application/domain/opportunity/usecase";

const utilityResolver = {
  Query: {
    utilities: async (_: unknown, args: GqlQueryUtilitiesArgs, ctx: IContext) =>
      UtilityUseCase.anyoneBrowseUtilities(ctx, args),

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
  Utility: {
    tickets: async (parent: GqlUtility, args: GqlUtilityTicketsArgs, ctx: IContext) => {
      return TicketUseCase.visitorBrowseTickets(ctx, { ...args, filter: { utilityId: parent.id } });
    },
    requiredForOpportunities: async (
      parent: GqlUtility,
      args: GqlUtilityRequiredForOpportunitiesArgs,
      ctx: IContext,
    ) => {
      return OpportunityUseCase.anyoneBrowseOpportunities(
        {
          ...args,
          filter: { requiredUtilityIds: [parent.id] },
        },
        ctx,
      );
    },
  },
};

export default utilityResolver;
