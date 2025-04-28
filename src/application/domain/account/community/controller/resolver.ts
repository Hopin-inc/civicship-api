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
import OpportunityUseCase from "@/application/domain/experience/opportunity/usecase";
import UtilityUseCase from "@/application/domain/reward/utility/usecase";
import logger from "@/infrastructure/logging";
import "reflect-metadata";
import { container } from "tsyringe";
import MembershipUseCase from "@/application/domain/account/membership/usecase";
import CommunityUseCase from "@/application/domain/account/community/usecase";
import WalletUseCase from "@/application/domain/account/wallet/usecase";
import ArticleUseCase from "@/application/domain/content/article/usecase";

const communityResolver = {
  Query: {
    communities: async (_: unknown, args: GqlQueryCommunitiesArgs, ctx: IContext) => {
      try {
        const communityUseCase = container.resolve(CommunityUseCase);
        return communityUseCase.userBrowseCommunities(args, ctx);
      } catch (e) {
        logger.error(e);
        return;
      }
    },
    community: async (_: unknown, args: GqlQueryCommunityArgs, ctx: IContext) => {
      const communityUseCase = container.resolve(CommunityUseCase);
      return communityUseCase.userViewCommunity(args, ctx);
    },
  },
  Mutation: {
    communityCreate: async (_: unknown, args: GqlMutationCommunityCreateArgs, ctx: IContext) => {
      const communityUseCase = container.resolve(CommunityUseCase);
      return communityUseCase.userCreateCommunityAndJoin(args, ctx);
    },
    communityDelete: async (_: unknown, args: GqlMutationCommunityDeleteArgs, ctx: IContext) => {
      const communityUseCase = container.resolve(CommunityUseCase);
      return communityUseCase.managerDeleteCommunity(args, ctx);
    },
    communityUpdateProfile: async (
      _: unknown,
      args: GqlMutationCommunityUpdateProfileArgs,
      ctx: IContext,
    ) => {
      const communityUseCase = container.resolve(CommunityUseCase);
      return communityUseCase.managerUpdateCommunityProfile(args, ctx);
    },
  },
  Community: {
    memberships: async (
      parent: GqlCommunity,
      args: GqlCommunityMembershipsArgs,
      ctx: IContext,
    ): Promise<GqlMembershipsConnection> => {
      const membershipUseCase = container.resolve(MembershipUseCase);
      return membershipUseCase.visitorBrowseMemberships(
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
      const opportunityUseCase = container.resolve(OpportunityUseCase);
      return opportunityUseCase.anyoneBrowseOpportunities(
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
      const participationUseCase = container.resolve(ParticipationUseCase);
      return participationUseCase.visitorBrowseParticipations(
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
      const walletUseCase = container.resolve(WalletUseCase);
      return walletUseCase.visitorBrowseWallets(
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
      const articleUseCase = container.resolve(ArticleUseCase);
      return articleUseCase.anyoneBrowseArticles(ctx, {
        ...args,
        filter: { ...args.filter, communityId: parent.id },
      });
    },
  },
};

export default communityResolver;
