import {
  GqlQueryOpportunitySlotsArgs,
  GqlQueryOpportunitySlotArgs,
  GqlOpportunitySlot,
  GqlOpportunitySlotParticipationsArgs,
  GqlMutationOpportunitySlotsBulkUpdateArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import ParticipationUseCase from "@/application/opportunity/participation/usecase";
import OpportunitySlotUseCase from "@/application/opportunity/slot/usecase";

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

    OpportunitySlot: {
      participations: async (
        parent: GqlOpportunitySlot,
        args: GqlOpportunitySlotParticipationsArgs,
        ctx: IContext,
      ) => {
        return ParticipationUseCase.visitorBrowseParticipationsByOpportunitySlot(parent, args, ctx);
      },
    },
  },
};

export default opportunitySlotResolver;
