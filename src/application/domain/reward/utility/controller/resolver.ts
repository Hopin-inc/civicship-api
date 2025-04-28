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
import UtilityUseCase from "@/application/domain/reward/utility/usecase";
import TicketUseCase from "@/application/domain/reward/ticket/usecase";
import OpportunityUseCase from "@/application/domain/experience/opportunity/usecase";
import { container } from "tsyringe";

const utilityResolver = {
  Query: {
    utilities: async (_: unknown, args: GqlQueryUtilitiesArgs, ctx: IContext) => {
      const useCase = container.resolve(UtilityUseCase);
      return useCase.anyoneBrowseUtilities(ctx, args);
    },

    utility: async (_: unknown, args: GqlQueryUtilityArgs, ctx: IContext) => {
      const useCase = container.resolve(UtilityUseCase);
      if (!ctx.loaders?.utility) {
        return useCase.visitorViewUtility(ctx, args);
      }
      return await ctx.loaders.utility.load(args.id);
    },
  },

  Mutation: {
    utilityCreate: async (_: unknown, args: GqlMutationUtilityCreateArgs, ctx: IContext) => {
      const useCase = container.resolve(UtilityUseCase);
      return useCase.managerCreateUtility(ctx, args);
    },
    utilityDelete: async (_: unknown, args: GqlMutationUtilityDeleteArgs, ctx: IContext) => {
      const useCase = container.resolve(UtilityUseCase);
      return useCase.managerDeleteUtility(ctx, args);
    },
    utilityUpdateInfo: async (_: unknown, args: GqlMutationUtilityUpdateInfoArgs, ctx: IContext) => {
      const useCase = container.resolve(UtilityUseCase);
      return useCase.managerUpdateUtilityInfo(ctx, args);
    },
  },

  Utility: {
    tickets: async (parent: GqlUtility, args: GqlUtilityTicketsArgs, ctx: IContext) => {
      const ticketUseCase = container.resolve(TicketUseCase);
      return ticketUseCase.visitorBrowseTickets(ctx, { ...args, filter: { utilityId: parent.id } });
    },
    requiredForOpportunities: async (
      parent: GqlUtility,
      args: GqlUtilityRequiredForOpportunitiesArgs,
      ctx: IContext,
    ) => {
      const opportunityUseCase = container.resolve(OpportunityUseCase);
      return opportunityUseCase.anyoneBrowseOpportunities(
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
