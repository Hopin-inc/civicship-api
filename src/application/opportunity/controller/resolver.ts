import {
  GqlMutationOpportunityCreateArgs,
  GqlMutationOpportunityDeleteArgs,
  GqlMutationOpportunitySetPublishStatusArgs,
  GqlMutationOpportunityUpdateContentArgs,
  GqlOpportunity,
  GqlOpportunityInvitationsArgs,
  GqlOpportunityParticipationsArgs,
  GqlOpportunitySlotsArgs,
  GqlQueryOpportunitiesAllArgs,
  GqlQueryOpportunitiesCommunityInternalArgs,
  GqlQueryOpportunitiesPublicArgs,
  GqlQueryOpportunityArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import OpportunityUseCase from "@/application/opportunity/usecase";
import ParticipationUseCase from "@/application/participation/usecase";
import OpportunitySlotUseCase from "@/application/opportunitySlot/usecase";
import OpportunityInvitationUseCase from "@/application/opportunityInvitation/usecase";

const opportunityResolver = {
  Query: {
    opportunitiesPublic: async (_: unknown, args: GqlQueryOpportunitiesPublicArgs, ctx: IContext) =>
      OpportunityUseCase.visitorBrowsePublicOpportunities(args, ctx),
    opportunitiesCommunityInternal: async (
      _: unknown,
      args: GqlQueryOpportunitiesCommunityInternalArgs,
      ctx: IContext,
    ) => OpportunityUseCase.memberBrowseCommunityInternalOpportunities(args, ctx),
    opportunitiesAll: async (_: unknown, args: GqlQueryOpportunitiesAllArgs, ctx: IContext) =>
      OpportunityUseCase.managerBrowseAllOpportunities(args, ctx),
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
  },
  Opportunity: {
    participations: async (
      parent: GqlOpportunity,
      args: GqlOpportunityParticipationsArgs,
      ctx: IContext,
    ) => {
      return ParticipationUseCase.visitorBrowseParticipationsByOpportunity(parent, args, ctx);
    },

    slots: async (parent: GqlOpportunity, args: GqlOpportunitySlotsArgs, ctx: IContext) => {
      return OpportunitySlotUseCase.visitorBrowseOpportunitySlotsByOpportunity(parent, args, ctx);
    },

    invitations: async (
      parent: GqlOpportunity,
      args: GqlOpportunityInvitationsArgs,
      ctx: IContext,
    ) => {
      return OpportunityInvitationUseCase.visitorBrowseOpportunityInvitationsByOpportunity(
        parent,
        args,
        ctx,
      );
    },
  },
};

export default opportunityResolver;
