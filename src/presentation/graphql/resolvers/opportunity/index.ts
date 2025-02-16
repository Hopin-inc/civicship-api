import {
  GqlMutationOpportunityCreateArgs,
  GqlMutationOpportunityDeleteArgs,
  GqlMutationOpportunitySetPublishStatusArgs,
  GqlMutationOpportunityUpdateContentArgs,
  GqlOpportunity,
  GqlOpportunityParticipationsArgs,
  GqlQueryOpportunitiesArgs,
  GqlQueryOpportunityArgs,
} from "@/types/graphql";
import OpportunityWriteUseCase from "@/application/opportunity/usecase/write";
import { IContext } from "@/types/server";
import ParticipationReadUseCase from "@/application/opportunity/participation/usecase/read";
import OpportunityReadUseCase from "@/application/opportunity/usecase/read";

const opportunityResolver = {
  Query: {
    opportunities: async (_: unknown, args: GqlQueryOpportunitiesArgs, ctx: IContext) =>
      OpportunityReadUseCase.visitorBrowsePublicOpportunities(args, ctx),
    opportunity: async (_: unknown, args: GqlQueryOpportunityArgs, ctx: IContext) => {
      if (!ctx.loaders?.opportunity) {
        return OpportunityReadUseCase.visitorViewOpportunity(args, ctx);
      }
      return ctx.loaders.opportunity.load(args.id);
    },
  },
  Mutation: {
    opportunityCreate: async (_: unknown, args: GqlMutationOpportunityCreateArgs, ctx: IContext) =>
      OpportunityWriteUseCase.managerCreateOpportunity(args, ctx),
    opportunityDelete: async (_: unknown, args: GqlMutationOpportunityDeleteArgs, ctx: IContext) =>
      OpportunityWriteUseCase.managerDeleteOpportunity(args, ctx),
    opportunityUpdateContent: async (
      _: unknown,
      args: GqlMutationOpportunityUpdateContentArgs,
      ctx: IContext,
    ) => OpportunityWriteUseCase.managerUpdateOpportunityContent(args, ctx),
    opportunitySetPublishStatus: async (
      _: unknown,
      args: GqlMutationOpportunitySetPublishStatusArgs,
      ctx: IContext,
    ) => OpportunityWriteUseCase.managerSetOpportunityPublishStatus(args, ctx),
  },
  Opportunity: {
    participations: async (
      parent: GqlOpportunity,
      args: GqlOpportunityParticipationsArgs,
      ctx: IContext,
    ) => {
      return ParticipationReadUseCase.visitorBrowseParticipationsByOpportunity(parent, args, ctx);
    },
  },
};

export default opportunityResolver;
