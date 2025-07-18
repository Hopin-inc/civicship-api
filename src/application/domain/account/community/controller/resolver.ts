import {
  GqlQueryCommunitiesArgs,
  GqlQueryCommunityArgs,
  GqlMutationCommunityCreateArgs,
  GqlMutationCommunityDeleteArgs,
  GqlMutationCommunityUpdateProfileArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import { inject, injectable } from "tsyringe";
import CommunityUseCase from "@/application/domain/account/community/usecase";

@injectable()
export default class CommunityResolver {
  constructor(@inject("CommunityUseCase") private readonly communityUseCase: CommunityUseCase) {}

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
    config: async (parent, _: unknown, ctx: IContext) => {
      const config = parent.config;
      if (!config) return null;

      const lineConfig = config.lineConfig;
      if (!ctx.isAdmin) {
        return {
          ...config,
          lineConfig: {
            ...lineConfig,
            accessToken: null,
            channelSecret: null,
          },
          firebaseConfig: null,
        };
      }

      return config;
    },

    image: (parent, _: unknown, ctx: IContext) => {
      return parent.imageId ? ctx.loaders.image.load(parent.imageId) : null;
    },

    places: (parent, _: unknown, ctx: IContext) => {
      return ctx.loaders.placesByCommunity.load(parent.id);
    },

    memberships: (parent, _: unknown, ctx: IContext) => {
      return ctx.loaders.membershipsByCommunity.load(parent.id);
    },

    wallets: (parent, _: unknown, ctx: IContext) => {
      return ctx.loaders.walletsByCommunity.load(parent.id);
    },

    opportunities: (parent, _: unknown, ctx: IContext) => {
      return ctx.loaders.opportunitiesByCommunity.load(parent.id);
    },

    participations: (parent, _: unknown, ctx: IContext) => {
      return ctx.loaders.participationsByCommunity.load(parent.id);
    },

    utilities: (parent, _: unknown, ctx: IContext) => {
      return ctx.loaders.utilitiesByCommunity.load(parent.id);
    },

    articles: (parent, _: unknown, ctx: IContext) => {
      return ctx.loaders.articlesByCommunity.load(parent.id);
    },
  };
}
