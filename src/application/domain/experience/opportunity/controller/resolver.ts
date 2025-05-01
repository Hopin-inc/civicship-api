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
import { injectable, inject } from "tsyringe";
import OpportunityUseCase from "@/application/domain/experience/opportunity/usecase";
import OpportunitySlotUseCase from "@/application/domain/experience/opportunitySlot/usecase";

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
    isReservableWithTicket: (parent: GqlOpportunity, _: unknown, ctx: IContext) => {
      return this.opportunityUseCase.checkUserHasValidTicketForOpportunity(ctx, parent.id);
    },
    slots: (parent: GqlOpportunity, args: GqlOpportunitySlotsArgs, ctx: IContext) => {
      return this.slotUseCase.visitorBrowseOpportunitySlots(
        {
          ...args,
          filter: { ...args.filter, opportunityId: parent.id },
        },
        ctx,
      );
    },
  };
}
