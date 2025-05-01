import {
  GqlQueryOpportunitySlotsArgs,
  GqlQueryOpportunitySlotArgs,
  GqlMutationOpportunitySlotSetHostingStatusArgs,
  GqlMutationOpportunitySlotsBulkUpdateArgs,
  GqlOpportunitySlot,
  GqlOpportunitySlotParticipationsArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import { injectable, inject } from "tsyringe";
import OpportunitySlotUseCase from "@/application/domain/experience/opportunitySlot/usecase";
import ParticipationUseCase from "@/application/domain/experience/participation/usecase";

@injectable()
export default class OpportunitySlotResolver {
  constructor(
    @inject("OpportunitySlotUseCase") private readonly slotUseCase: OpportunitySlotUseCase,
    @inject("ParticipationUseCase") private readonly participationUseCase: ParticipationUseCase,
  ) {}

  Query = {
    opportunitySlots: (_: unknown, args: GqlQueryOpportunitySlotsArgs, ctx: IContext) => {
      return this.slotUseCase.visitorBrowseOpportunitySlots(args, ctx);
    },
    opportunitySlot: (_: unknown, args: GqlQueryOpportunitySlotArgs, ctx: IContext) => {
      return this.slotUseCase.visitorViewOpportunitySlot(args, ctx);
    },
  };

  Mutation = {
    opportunitySlotSetHostingStatus: (
      _: unknown,
      args: GqlMutationOpportunitySlotSetHostingStatusArgs,
      ctx: IContext,
    ) => {
      return this.slotUseCase.managerSetOpportunitySlotHostingStatus(args, ctx);
    },
    opportunitySlotsBulkUpdate: (
      _: unknown,
      args: GqlMutationOpportunitySlotsBulkUpdateArgs,
      ctx: IContext,
    ) => {
      return this.slotUseCase.managerBulkUpdateOpportunitySlots(args, ctx);
    },
  };

  OpportunitySlot = {
    participations: (
      parent: GqlOpportunitySlot,
      args: GqlOpportunitySlotParticipationsArgs,
      ctx: IContext,
    ) => {
      return this.participationUseCase.visitorBrowseParticipations(
        {
          ...args,
          filter: { ...args.filter, opportunitySlotId: parent.id },
        },
        ctx,
      );
    },
  };
}
