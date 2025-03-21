import {
  GqlQueryOpportunitySlotsArgs,
  GqlQueryOpportunitySlotArgs,
  GqlOpportunitySlot,
  GqlOpportunitySlotParticipationsArgs,
  GqlMutationOpportunitySlotsBulkUpdateArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import OpportunitySlotUseCase from "@/application/opportunitySlot/usecase";
import ParticipationUseCase from "@/application/participation/usecase";

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
