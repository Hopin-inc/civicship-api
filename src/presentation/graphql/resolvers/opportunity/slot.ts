import {
  GqlQueryOpportunitySlotsArgs,
  GqlQueryOpportunitySlotArgs,
  GqlOpportunitySlot,
  GqlOpportunitySlotParticipationsArgs,
  GqlMutationOpportunitySlotsBulkUpdateArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import ParticipationReadUseCase from "@/application/opportunity/participation/usecase/read";
import OpportunitySlotReadUseCase from "@/application/opportunity/slot/usecase/read";
import OpportunitySlotWriteUseCase from "@/application/opportunity/slot/usecase/write";

const opportunitySlotResolver = {
  Query: {
    opportunitySlots: async (_: unknown, args: GqlQueryOpportunitySlotsArgs, ctx: IContext) => {
      return OpportunitySlotReadUseCase.visitorBrowseOpportunitySlots(args, ctx);
    },
    opportunitySlot: async (_: unknown, args: GqlQueryOpportunitySlotArgs, ctx: IContext) => {
      if (!ctx.loaders?.opportunitySlot) {
        return OpportunitySlotReadUseCase.visitorViewOpportunitySlot(args, ctx);
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
      return OpportunitySlotWriteUseCase.managerBulkUpdateOpportunitySlots(args, ctx);
    },

    OpportunitySlot: {
      participations: async (
        parent: GqlOpportunitySlot,
        args: GqlOpportunitySlotParticipationsArgs,
        ctx: IContext,
      ) => {
        return ParticipationReadUseCase.visitorBrowseParticipationsByOpportunitySlot(
          parent,
          args,
          ctx,
        );
      },
    },
  },
};

export default opportunitySlotResolver;
