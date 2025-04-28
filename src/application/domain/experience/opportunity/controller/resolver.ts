import {
  GqlMutationOpportunityCreateArgs,
  GqlMutationOpportunityDeleteArgs,
  GqlMutationOpportunitySetPublishStatusArgs,
  GqlMutationOpportunityUpdateContentArgs,
  GqlOpportunity,
  GqlOpportunitySlotsArgs,
  GqlQueryOpportunitiesArgs,
  GqlQueryOpportunityArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import OpportunityUseCase from "@/application/domain/experience/opportunity/usecase";
import OpportunitySlotUseCase from "@/application/domain/experience/opportunitySlot/usecase";
import { container } from "tsyringe";

const opportunityResolver = {
  Query: {
    opportunities: async (_: unknown, args: GqlQueryOpportunitiesArgs, ctx: IContext) => {
      const useCase = container.resolve(OpportunityUseCase);
      return useCase.anyoneBrowseOpportunities(args, ctx);
    },
    opportunity: async (_: unknown, args: GqlQueryOpportunityArgs, ctx: IContext) => {
      const useCase = container.resolve(OpportunityUseCase);
      return useCase.visitorViewOpportunity(args, ctx);
    },
  },
  Mutation: {
    opportunityCreate: async (
      _: unknown,
      args: GqlMutationOpportunityCreateArgs,
      ctx: IContext,
    ) => {
      const useCase = container.resolve(OpportunityUseCase);
      return useCase.managerCreateOpportunity(args, ctx);
    },
    opportunityDelete: async (
      _: unknown,
      args: GqlMutationOpportunityDeleteArgs,
      ctx: IContext,
    ) => {
      const useCase = container.resolve(OpportunityUseCase);
      return useCase.managerDeleteOpportunity(args, ctx);
    },
    opportunityUpdateContent: async (
      _: unknown,
      args: GqlMutationOpportunityUpdateContentArgs,
      ctx: IContext,
    ) => {
      const useCase = container.resolve(OpportunityUseCase);
      return useCase.managerUpdateOpportunityContent(args, ctx);
    },
    opportunitySetPublishStatus: async (
      _: unknown,
      args: GqlMutationOpportunitySetPublishStatusArgs,
      ctx: IContext,
    ) => {
      const useCase = container.resolve(OpportunityUseCase);
      return useCase.managerSetOpportunityPublishStatus(args, ctx);
    },
  },
  Opportunity: {
    isReservableWithTicket: async (parent: GqlOpportunity, _, ctx: IContext) => {
      const useCase = container.resolve(OpportunityUseCase);
      return useCase.checkUserHasValidTicketForOpportunity(ctx, parent.id);
    },
    slots: async (parent: GqlOpportunity, args: GqlOpportunitySlotsArgs, ctx: IContext) => {
      const useCase = container.resolve(OpportunitySlotUseCase);
      return useCase.visitorBrowseOpportunitySlots(
        {
          ...args,
          filter: { opportunityId: parent.id },
        },
        ctx,
      );
    },
  },
};

export default opportunityResolver;
