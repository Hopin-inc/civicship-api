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

const opportunitySlotResolver = {
  Query: {
    opportunitySlots: async (_: unknown, args: GqlQueryOpportunitySlotsArgs, ctx: IContext) => {
      return OpportunitySlotUseCase.visitorBrowseOpportunitySlots(args, ctx);
    },
    opportunitySlot: async (_: unknown, args: GqlQueryOpportunitySlotArgs, ctx: IContext) => {
      if (!ctx.loaders?.opportunitySlot) {
        return OpportunitySlotUseCase.visitorViewOpportunitySlot(args, ctx);
      }
      return ctx.loaders.opportunitySlot.load(args.id);
    },
  },

  Mutation: {
    opportunitySlotSetHostingStatus: async (
      _: unknown,
      args: GqlMutationOpportunitySlotSetHostingStatusArgs,
      ctx: IContext,
    ) => {
      return OpportunitySlotUseCase.managerSetOpportunitySlotHostingStatus(args, ctx);
    },
    opportunitySlotsBulkUpdate: async (
      _: unknown,
      args: GqlMutationOpportunitySlotsBulkUpdateArgs,
      ctx: IContext,
    ) => {
      return OpportunitySlotUseCase.managerBulkUpdateOpportunitySlots(args, ctx);
    },
  },

  OpportunitySlot: {
    participations: async (
      parent: GqlOpportunitySlot,
      args: GqlOpportunitySlotParticipationsArgs,
      ctx: IContext,
    ) => {
      return ParticipationUseCase.visitorBrowseParticipations(
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
