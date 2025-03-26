import {
  GqlMutationOpportunityCreateArgs,
  GqlMutationOpportunityDeleteArgs,
  GqlMutationOpportunitySetHostingStatusArgs,
  GqlMutationOpportunitySetPublishStatusArgs,
  GqlMutationOpportunityUpdateContentArgs,
  GqlOpportunity,
  GqlOpportunityInvitationsArgs,
  GqlOpportunitySlotsArgs,
  GqlQueryOpportunitiesArgs,
  GqlQueryOpportunityArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import OpportunityUseCase from "@/application/domain/opportunity/usecase";
import OpportunitySlotUseCase from "@/application/domain/opportunitySlot/usecase";
import OpportunityInvitationUseCase from "@/application/domain/invitation/usecase";

const opportunityResolver = {
  Query: {
    opportunities: async (_: unknown, args: GqlQueryOpportunitiesArgs, ctx: IContext) =>
      OpportunityUseCase.anyoneBrowseOpportunities(args, ctx),
    opportunity: async (_: unknown, args: GqlQueryOpportunityArgs, ctx: IContext) => {
      if (!ctx.loaders?.opportunity) {
        return OpportunityUseCase.visitorViewOpportunity(args, ctx);
      }
      return ctx.loaders.opportunity.load(args.id);
    },
  },
  Mutation: {
    opportunityCreate: async (_: unknown, args: GqlMutationOpportunityCreateArgs, ctx: IContext) =>
      OpportunityUseCase.managerCreateOpportunity(args, ctx),
    opportunityDelete: async (_: unknown, args: GqlMutationOpportunityDeleteArgs, ctx: IContext) =>
      OpportunityUseCase.managerDeleteOpportunity(args, ctx),
    opportunityUpdateContent: async (
      _: unknown,
      args: GqlMutationOpportunityUpdateContentArgs,
      ctx: IContext,
    ) => OpportunityUseCase.managerUpdateOpportunityContent(args, ctx),
    opportunitySetPublishStatus: async (
      _: unknown,
      args: GqlMutationOpportunitySetPublishStatusArgs,
      ctx: IContext,
    ) => OpportunityUseCase.managerSetOpportunityPublishStatus(args, ctx),
    opportunitySetHostingStatus: async (
      _: unknown,
      args: GqlMutationOpportunitySetHostingStatusArgs,
      ctx: IContext,
    ) => OpportunityUseCase.managerSetOpportunityHostingStatus(args, ctx),
  },
  Opportunity: {
    slots: async (parent: GqlOpportunity, args: GqlOpportunitySlotsArgs, ctx: IContext) => {
      return OpportunitySlotUseCase.visitorBrowseOpportunitySlots(
        {
          ...args,
          filter: { opportunityId: parent.id },
        },
        ctx,
      );
    },
    invitations: async (
      parent: GqlOpportunity,
      args: GqlOpportunityInvitationsArgs,
      ctx: IContext,
    ) => {
      return OpportunityInvitationUseCase.visitorBrowseOpportunityInvitations(
        {
          ...args,
          filter: { ...args.filter, opportunityId: parent.id },
        },
        ctx,
      );
    },
  },
};

export default opportunityResolver;
