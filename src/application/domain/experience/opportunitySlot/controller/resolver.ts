import {
  GqlQueryOpportunitySlotsArgs,
  GqlQueryOpportunitySlotArgs,
  GqlOpportunitySlot,
  GqlOpportunitySlotParticipationsArgs,
  GqlMutationOpportunitySlotsBulkUpdateArgs,
  GqlMutationOpportunitySlotSetHostingStatusArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import OpportunitySlotUseCase from "@/application/domain/experience/opportunitySlot/usecase";
import ParticipationUseCase from "@/application/domain/experience/participation/usecase";
import { container } from "tsyringe";

const opportunitySlotResolver = {
  Query: {
    opportunitySlots: async (_: unknown, args: GqlQueryOpportunitySlotsArgs, ctx: IContext) => {
      const useCase = container.resolve(OpportunitySlotUseCase);
      return useCase.visitorBrowseOpportunitySlots(args, ctx);
    },
    opportunitySlot: async (_: unknown, args: GqlQueryOpportunitySlotArgs, ctx: IContext) => {
      const useCase = container.resolve(OpportunitySlotUseCase);
      return useCase.visitorViewOpportunitySlot(args, ctx);
    },
  },

  Mutation: {
    opportunitySlotSetHostingStatus: async (
      _: unknown,
      args: GqlMutationOpportunitySlotSetHostingStatusArgs,
      ctx: IContext,
    ) => {
      const useCase = container.resolve(OpportunitySlotUseCase);
      return useCase.managerSetOpportunitySlotHostingStatus(args, ctx);
    },
    opportunitySlotsBulkUpdate: async (
      _: unknown,
      args: GqlMutationOpportunitySlotsBulkUpdateArgs,
      ctx: IContext,
    ) => {
      const useCase = container.resolve(OpportunitySlotUseCase);
      return useCase.managerBulkUpdateOpportunitySlots(args, ctx);
    },
  },

  OpportunitySlot: {
    participations: async (
      parent: GqlOpportunitySlot,
      args: GqlOpportunitySlotParticipationsArgs,
      ctx: IContext,
    ) => {
      const useCase = container.resolve(ParticipationUseCase);
      return useCase.visitorBrowseParticipations(
        {
          filter: { opportunitySlotId: parent.id },
          ...args,
        },
        ctx,
      );
    },
  },
};

export default opportunitySlotResolver;
