import {
  GqlMutationOpportunityCreateArgs,
  GqlMutationOpportunityDeleteArgs,
  GqlMutationOpportunitySetPublishStatusArgs,
  GqlMutationOpportunityUpdateContentArgs,
  GqlOpportunitySlotsArgs,
  GqlQueryOpportunitiesArgs,
  GqlQueryOpportunityArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import { injectable, inject } from "tsyringe";
import OpportunityUseCase from "@/application/domain/experience/opportunity/usecase";
import OpportunitySlotUseCase from "@/application/domain/experience/opportunitySlot/usecase";
import { PrismaOpportunityDetail } from "@/application/domain/experience/opportunity/data/type";

@injectable()
export default class OpportunityResolver {
  constructor(
    @inject("OpportunityUseCase") private readonly opportunityUseCase: OpportunityUseCase,
    @inject("OpportunitySlotUseCase") private readonly slotUseCase: OpportunitySlotUseCase,
  ) {}

  Query = {
    opportunities: (_: unknown, args: GqlQueryOpportunitiesArgs, ctx: IContext) => {
      return this.opportunityUseCase.anyoneBrowseOpportunities(args, ctx);
    },
    opportunity: (_: unknown, args: GqlQueryOpportunityArgs, ctx: IContext) => {
      if (ctx.loaders.opportunity) {
        return ctx.loaders.opportunity.load(args.id);
      }
      return this.opportunityUseCase.visitorViewOpportunity(args, ctx);
    },
  };

  Mutation = {
    opportunityCreate: (_: unknown, args: GqlMutationOpportunityCreateArgs, ctx: IContext) => {
      return this.opportunityUseCase.managerCreateOpportunity(args, ctx);
    },
    opportunityDelete: (_: unknown, args: GqlMutationOpportunityDeleteArgs, ctx: IContext) => {
      return this.opportunityUseCase.managerDeleteOpportunity(args, ctx);
    },
    opportunityUpdateContent: (
      _: unknown,
      args: GqlMutationOpportunityUpdateContentArgs,
      ctx: IContext,
    ) => {
      return this.opportunityUseCase.managerUpdateOpportunityContent(args, ctx);
    },
    opportunitySetPublishStatus: (
      _: unknown,
      args: GqlMutationOpportunitySetPublishStatusArgs,
      ctx: IContext,
    ) => {
      return this.opportunityUseCase.managerSetOpportunityPublishStatus(args, ctx);
    },
  };

  Opportunity = {
    community: (parent: PrismaOpportunityDetail, _: unknown, ctx: IContext) => {
      return parent.communityId ? ctx.loaders.community.load(parent.communityId) : null;
    },
    
    place: (parent: PrismaOpportunityDetail, _: unknown, ctx: IContext) => {
      return parent.placeId ? ctx.loaders.place.load(parent.placeId) : null;
    },
    
    createdByUser: (parent: PrismaOpportunityDetail, _: unknown, ctx: IContext) => {
      return parent.createdByUserId ? ctx.loaders.user.load(parent.createdByUserId) : null;
    },
    
    requiredUtilities: (parent: PrismaOpportunityDetail, _: unknown, ctx: IContext) => {
      return parent.requiredUtilities ? ctx.loaders.utility.loadMany(parent.requiredUtilities.map(u => u.id)) : [];
    },
    
    isReservableWithTicket: (parent: PrismaOpportunityDetail, _: unknown, ctx: IContext) => {
      return this.opportunityUseCase.checkUserHasValidTicketForOpportunity(ctx, parent.id);
    },
    
    slots: (parent: PrismaOpportunityDetail, args: GqlOpportunitySlotsArgs, ctx: IContext) => {
      return this.slotUseCase.visitorBrowseOpportunitySlots(
        {
          ...args,
          filter: { ...args.filter, opportunityId: parent.id },
        },
        ctx,
      );
    },
    
    articles: (parent: PrismaOpportunityDetail, _: unknown, ctx: IContext) => {
      return null;
    },
  };
}
