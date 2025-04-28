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
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { createWalletUseCase } from "@/application/domain/account/wallet/provider";
import { createCommunityUseCase } from "@/application/domain/account/community/provider";
import { createMembershipUseCase } from "@/application/domain/account/membership/provider";
import { createArticleUseCase } from "@/application/domain/content/article/provider";

const issuer = new PrismaClientIssuer();
const walletUseCase = createWalletUseCase(issuer);
const communityUseCase = createCommunityUseCase(issuer);
const membershipUseCase = createMembershipUseCase(issuer);
const articleUseCase = createArticleUseCase(issuer);

const communityResolver = {
  Query: {
    communities: async (_: unknown, args: GqlQueryCommunitiesArgs, ctx: IContext) => {
      try {
        return communityUseCase.userBrowseCommunities(args, ctx);
      } catch (e) {
        logger.error(e);
        return;
      }
    },
    community: async (_: unknown, args: GqlQueryCommunityArgs, ctx: IContext) => {
      return communityUseCase.userViewCommunity(args, ctx);
    },
  },
  Mutation: {
    communityCreate: async (_: unknown, args: GqlMutationCommunityCreateArgs, ctx: IContext) =>
      communityUseCase.userCreateCommunityAndJoin(args, ctx),
    communityDelete: async (_: unknown, args: GqlMutationCommunityDeleteArgs, ctx: IContext) =>
      communityUseCase.managerDeleteCommunity(args, ctx),
    communityUpdateProfile: async (
      _: unknown,
      args: GqlMutationCommunityUpdateProfileArgs,
      ctx: IContext,
    ) => communityUseCase.managerUpdateCommunityProfile(args, ctx),
  },
  Community: {
    memberships: async (
      parent: GqlCommunity,
      args: GqlCommunityMembershipsArgs,
      ctx: IContext,
    ): Promise<GqlMembershipsConnection> => {
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
      return articleUseCase.anyoneBrowseArticles(ctx, {
        ...args,
        filter: { ...args.filter, communityId: parent.id },
      });
    },
  },
};

export default communityResolver;
