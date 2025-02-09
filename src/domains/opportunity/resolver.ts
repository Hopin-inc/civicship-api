import {
  GqlMutationOpportunityCreateArgs,
  GqlMutationOpportunityDeleteArgs,
  GqlMutationOpportunityEditContentArgs,
  GqlMutationOpportunitySetCommunityInternalArgs,
  GqlMutationOpportunitySetPrivateArgs,
  GqlMutationOpportunitySetPublicArgs,
  GqlQueryOpportunitiesArgs,
  GqlQueryOpportunityArgs,
} from "@/types/graphql";
import OpportunityUseCase from "@/domains/opportunity/usecase";
import { IContext } from "@/types/server";

const opportunityResolver = {
  Query: {
    opportunities: async (_: unknown, args: GqlQueryOpportunitiesArgs, ctx: IContext) =>
      OpportunityUseCase.visitorBrowsePublicOpportunities(args, ctx),
    opportunity: async (_: unknown, args: GqlQueryOpportunityArgs, ctx: IContext) =>
      OpportunityUseCase.visitorViewOpportunity(args, ctx),
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
    opportunitySetPublic: async (
      _: unknown,
      args: GqlMutationOpportunitySetPublicArgs,
      ctx: IContext,
    ) => OpportunityUseCase.managerSetOpportunityToPublic(args, ctx),
    opportunitySetCommunityInternal: async (
      _: unknown,
      args: GqlMutationOpportunitySetCommunityInternalArgs,
      ctx: IContext,
    ) => OpportunityUseCase.managerSetOpportunityToCommunityInternal(args, ctx),
    opportunitySetPrivate: async (
      _: unknown,
      args: GqlMutationOpportunitySetPrivateArgs,
      ctx: IContext,
    ) => OpportunityUseCase.managerSetOpportunityToPrivate(args, ctx),
  },
};

export default opportunityResolver;
