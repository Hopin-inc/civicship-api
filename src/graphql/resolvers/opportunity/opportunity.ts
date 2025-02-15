import {
  GqlMutationOpportunityCreateArgs,
  GqlMutationOpportunityDeleteArgs,
  GqlMutationOpportunityEditContentArgs,
  GqlMutationOpportunitySetPublishStatusArgs,
  GqlOpportunity,
  GqlOpportunityParticipationsArgs,
  GqlQueryOpportunitiesArgs,
  GqlQueryOpportunityArgs,
} from "@/types/graphql";
import OpportunityUseCase from "@/domains/opportunity/usecase";
import { IContext } from "@/types/server";
import ParticipationUseCase from "@/domains/opportunity/participation/usecase";

const opportunityResolver = {
  Query: {
    opportunities: async (_: unknown, args: GqlQueryOpportunitiesArgs, ctx: IContext) =>
      OpportunityUseCase.visitorBrowsePublicOpportunities(args, ctx),
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
    opportunityEditContent: async (
      _: unknown,
      args: GqlMutationOpportunityEditContentArgs,
      ctx: IContext,
    ) => OpportunityUseCase.managerEditOpportunityContent(args, ctx),
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
  },
};

export default opportunityResolver;
