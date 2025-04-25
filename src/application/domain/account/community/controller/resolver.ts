import {
  GqlQueryCommunitiesArgs,
  GqlQueryCommunityArgs,
  GqlMutationCommunityCreateArgs,
  GqlMutationCommunityDeleteArgs,
  GqlMutationCommunityUpdateProfileArgs,
  GqlCommunity,
  GqlMembershipsConnection,
  GqlOpportunitiesConnection,
  GqlParticipationsConnection,
  GqlWalletsConnection,
  GqlUtilitiesConnection,
  GqlCommunityMembershipsArgs,
  GqlCommunityOpportunitiesArgs,
  GqlCommunityParticipationsArgs,
  GqlCommunityWalletsArgs,
  GqlCommunityUtilitiesArgs,
  GqlCommunityArticlesArgs,
  GqlArticlesConnection,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import ParticipationUseCase from "@/application/domain/experience/participation/usecase";
import WalletUseCase from "@/application/domain/account/wallet/usecase";
import CommunityUseCase from "@/application/domain/account/community/usecase";
import MembershipUseCase from "@/application/domain/account/membership/usecase";
import OpportunityUseCase from "@/application/domain/experience/opportunity/usecase";
import UtilityUseCase from "@/application/domain/reward/utility/usecase";
import ArticleUseCase from "@/application/domain/content/article/usecase";

const communityResolver = {
  Query: {
    communities: async (_: unknown, args: GqlQueryCommunitiesArgs, ctx: IContext) => {
      try {
        console.log("START!!");
        return CommunityUseCase.userBrowseCommunities(args, ctx);
      } catch (e) {
        console.error(e);
        return;
      }
    },
    community: async (_: unknown, args: GqlQueryCommunityArgs, ctx: IContext) => {
      if (!ctx.loaders?.community) {
        return CommunityUseCase.userViewCommunity(args, ctx);
      }
      return await ctx.loaders.community.load(args.id);
    },
  },
  Mutation: {
    communityCreate: async (_: unknown, args: GqlMutationCommunityCreateArgs, ctx: IContext) =>
      CommunityUseCase.userCreateCommunityAndJoin(args, ctx),
    communityDelete: async (_: unknown, args: GqlMutationCommunityDeleteArgs, ctx: IContext) =>
      CommunityUseCase.managerDeleteCommunity(args, ctx),
    communityUpdateProfile: async (
      _: unknown,
      args: GqlMutationCommunityUpdateProfileArgs,
      ctx: IContext,
    ) => CommunityUseCase.managerUpdateCommunityProfile(args, ctx),
  },
  Community: {
    memberships: async (
      parent: GqlCommunity,
      args: GqlCommunityMembershipsArgs,
      ctx: IContext,
    ): Promise<GqlMembershipsConnection> => {
      return MembershipUseCase.visitorBrowseMemberships(
        {
          ...args,
          filter: { ...args.filter, communityId: parent.id },
        },
        ctx,
      );
    },

    opportunities: async (
      parent: GqlCommunity,
      args: GqlCommunityOpportunitiesArgs,
      ctx: IContext,
    ): Promise<GqlOpportunitiesConnection> => {
      return OpportunityUseCase.anyoneBrowseOpportunities(
        {
          ...args,
          filter: { ...args.filter, communityIds: [parent.id] },
        },
        ctx,
      );
    },

    participations: async (
      parent: GqlCommunity,
      args: GqlCommunityParticipationsArgs,
      ctx: IContext,
    ): Promise<GqlParticipationsConnection> => {
      return ParticipationUseCase.visitorBrowseParticipations(
        {
          filter: { communityId: parent.id },
          ...args,
        },
        ctx,
      );
    },

    wallets: async (
      parent: GqlCommunity,
      args: GqlCommunityWalletsArgs,
      ctx: IContext,
    ): Promise<GqlWalletsConnection> => {
      return WalletUseCase.visitorBrowseWallets(
        {
          ...args,
          filter: { ...args.filter, communityId: parent.id },
        },
        ctx,
      );
    },

    utilities: async (
      parent: GqlCommunity,
      args: GqlCommunityUtilitiesArgs,
      ctx: IContext,
    ): Promise<GqlUtilitiesConnection> => {
      return UtilityUseCase.anyoneBrowseUtilities(ctx, {
        ...args,
        filter: { ...args.filter, communityId: parent.id },
      });
    },

    articles: async (
      parent: GqlCommunity,
      args: GqlCommunityArticlesArgs,
      ctx: IContext,
    ): Promise<GqlArticlesConnection> => {
      return ArticleUseCase.anyoneBrowseArticles(ctx, {
        ...args,
        filter: { ...args.filter, communityId: parent.id },
      });
    },
  },
};

export default communityResolver;
