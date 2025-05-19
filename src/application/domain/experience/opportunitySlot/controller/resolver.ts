import {
  GqlQueryOpportunitySlotsArgs,
  GqlQueryOpportunitySlotArgs,
  GqlMutationOpportunitySlotSetHostingStatusArgs,
  GqlMutationOpportunitySlotsBulkUpdateArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import { injectable, inject } from "tsyringe";
import OpportunitySlotUseCase from "@/application/domain/experience/opportunitySlot/usecase";
import { PrismaOpportunitySlotDetail } from "@/application/domain/experience/opportunitySlot/data/type";

@injectable()
export default class OpportunitySlotResolver {
  constructor(
    @inject("OpportunitySlotUseCase") private readonly slotUseCase: OpportunitySlotUseCase,
  ) {}

  Query = {
    opportunitySlots: (_: unknown, args: GqlQueryOpportunitySlotsArgs, ctx: IContext) => {
      return this.slotUseCase.visitorBrowseOpportunitySlots(args, ctx);
    },
    opportunitySlot: (_: unknown, args: GqlQueryOpportunitySlotArgs, ctx: IContext) => {
      return ctx.loaders.opportunitySlot.load(args.id);
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
    opportunity: (parent: PrismaOpportunitySlotDetail, _: unknown, ctx: IContext) => {
      return parent.opportunityId ? ctx.loaders.opportunity.load(parent.opportunityId) : null;
    },

    reservations: (parent: PrismaOpportunitySlotDetail, _: unknown, ctx: IContext) => {
      return ctx.loaders.reservationByOpportunitySlot.load(parent.id);
    },
  };
}
