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
    
    participations: (parent: PrismaOpportunitySlotDetail, _: unknown, ctx: IContext) => {
      return ctx.issuer.internal(async (tx) => {
        const reservations = await tx.reservation.findMany({
          where: { opportunitySlotId: parent.id },
          select: { id: true },
        });
        
        const participations = await tx.participation.findMany({
          where: { 
            reservationId: { 
              in: reservations.map(r => r.id) 
            } 
          },
          select: { id: true },
        });
        
        return ctx.loaders.participation.loadMany(participations.map(p => p.id));
      });
    },
    
    reservations: (parent: PrismaOpportunitySlotDetail, _: unknown, ctx: IContext) => {
      return parent.reservations ? 
        ctx.loaders.reservation.loadMany(parent.reservations.map(r => r.id)) : 
        [];
    },
  };
}
