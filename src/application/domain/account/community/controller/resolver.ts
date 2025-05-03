import {
  GqlQueryCommunitiesArgs,
  GqlQueryCommunityArgs,
  GqlMutationCommunityCreateArgs,
  GqlMutationCommunityDeleteArgs,
  GqlMutationCommunityUpdateProfileArgs,
} from "@/types/graphql";
import { PrismaCommunityDetail } from "@/application/domain/account/community/data/type";
import { IContext } from "@/types/server";
import { inject, injectable } from "tsyringe";
import CommunityUseCase from "@/application/domain/account/community/usecase";

@injectable()
export default class CommunityResolver {
  constructor(
    @inject("CommunityUseCase") private readonly communityUseCase: CommunityUseCase,
  ) {}

  Query = {
    communities: async (_: unknown, args: GqlQueryCommunitiesArgs, ctx: IContext) => {
      return this.communityUseCase.userBrowseCommunities(args, ctx);
    },
    community: async (_: unknown, args: GqlQueryCommunityArgs, ctx: IContext) => {
      return this.communityUseCase.userViewCommunity(args, ctx);
    },
  };

  Mutation = {
    communityCreate: async (_: unknown, args: GqlMutationCommunityCreateArgs, ctx: IContext) => {
      return this.communityUseCase.userCreateCommunityAndJoin(args, ctx);
    },
    communityDelete: async (_: unknown, args: GqlMutationCommunityDeleteArgs, ctx: IContext) => {
      return this.communityUseCase.ownerDeleteCommunity(args, ctx);
    },
    communityUpdateProfile: async (
      _: unknown,
      args: GqlMutationCommunityUpdateProfileArgs,
      ctx: IContext,
    ) => {
      return this.communityUseCase.managerUpdateCommunityProfile(args, ctx);
    },
  };

  Community = {
    places: (parent: PrismaCommunityDetail, _: unknown, ctx: IContext) => {
      return parent.places && ctx.loaders?.place ? ctx.loaders.place.loadMany(parent.places.map((p) => p.id)) : null;
    },

    image: (parent: PrismaCommunityDetail, _: unknown, ctx: IContext) => {
      return parent.imageId ? parent.imageId : null;
    },

    memberships: (parent: PrismaCommunityDetail, _: unknown, ctx: IContext) => {
      return parent.memberships && ctx.loaders?.membership ? 
        ctx.loaders.membership.loadMany(parent.memberships.map((m) => m.userId + ":" + m.communityId)) : 
        null;
    },

    opportunities: (parent: PrismaCommunityDetail, _: unknown, ctx: IContext) => {
      return ctx.loaders?.opportunity ? 
        ctx.loaders.opportunity.loadMany(parent.id) : 
        null;
    },

    participations: (parent: PrismaCommunityDetail, _: unknown, ctx: IContext) => {
      return ctx.loaders?.participation ? 
        ctx.loaders.participation.loadMany(parent.id) : 
        null;
    },

    wallets: (parent: PrismaCommunityDetail, _: unknown, ctx: IContext) => {
      return ctx.loaders?.wallet ? 
        ctx.loaders.wallet.loadMany(parent.id) : 
        null;
    },

    utilities: (parent: PrismaCommunityDetail, _: unknown, ctx: IContext) => {
      return ctx.loaders?.utility ? 
        ctx.loaders.utility.loadMany(parent.id) : 
        null;
    },

    articles: (parent: PrismaCommunityDetail, _: unknown, ctx: IContext) => {
      return ctx.loaders?.article ? 
        ctx.loaders.article.loadMany(parent.id) : 
        null;
    },
  };
}
