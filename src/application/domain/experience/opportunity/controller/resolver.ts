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

@injectable()
export default class OpportunityResolver {
  constructor(
    @inject("OpportunityUseCase") private readonly opportunityUseCase: OpportunityUseCase,
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
    community: (parent, _: unknown, ctx: IContext) => {
      return parent.communityId ? ctx.loaders.community.load(parent.communityId) : null;
    },

    place: (parent, _: unknown, ctx: IContext) => {
      return parent.placeId ? ctx.loaders.place.load(parent.placeId) : null;
    },

    createdByUser: (parent, _: unknown, ctx: IContext) => {
      return parent.createdBy ? ctx.loaders.user.load(parent.createdBy) : null;
    },

    isReservableWithTicket: async (parent, _, ctx: IContext) => {
      const userId = ctx.currentUser?.id;
      const communityId = parent.communityId;

      if (!userId || !communityId) {
        return false;
      }

      const result = await ctx.loaders.isReservableWithTicket.load({
        userId: userId,
        communityId: communityId,
        opportunityId: parent.id,
      });

      return result ?? false;
    },

    images: (parent, _: unknown, ctx: IContext) => {
      return ctx.loaders.imagesByOpportunity.load(parent.id);
    },

    requiredUtilities: (parent, _: unknown, ctx: IContext) => {
      return ctx.loaders.utilitiesByOpportunity.load(parent.id);
    },

    slots: (parent, args: GqlOpportunitySlotsArgs, ctx: IContext) => {
      return ctx.loaders.opportunitySlotByOpportunity.load({
        key: parent.id,
        filter: args.filter ?? {},
        sort: args.sort ?? {},
      });
    },

    articles: (parent, _: unknown, ctx: IContext) => {
      return ctx.loaders.articlesByOpportunity.load(parent.id);
    },
  };
}
