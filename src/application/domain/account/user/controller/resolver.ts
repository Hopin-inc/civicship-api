import {
  GqlArticlesConnection,
  GqlMembershipsConnection,
  GqlMutationUserUpdateMyProfileArgs,
  GqlOpportunitiesConnection,
  GqlParticipationsConnection,
  GqlParticipationStatusHistoriesConnection,
  GqlPortfoliosConnection,
  GqlQueryUserArgs,
  GqlQueryUsersArgs,
  GqlUser,
  GqlUserArticlesAboutMeArgs,
  GqlUserMembershipsArgs,
  GqlUserOpportunitiesCreatedByMeArgs,
  GqlUserParticipationsArgs,
  GqlUserParticipationStatusChangedByMeArgs,
  GqlUserPortfoliosArgs,
  GqlUserWalletsArgs,
  GqlWalletsConnection,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import OpportunityUseCase from "@/application/domain/experience/opportunity/usecase";
import ParticipationUseCase from "@/application/domain/experience/participation/usecase";
import ParticipationStatusHistoryUseCase from "@/application/domain/experience/participation/statusHistory/usecase";
import ViewUseCase from "@/application/view/usecase";
import ArticleUseCase from "@/application/domain/content/article/usecase";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { createWalletUseCase } from "@/application/domain/account/wallet/provider";
import { createUserUseCase } from "@/application/domain/account/user/provider";
import { createMembershipUseCase } from "@/application/domain/account/membership/provider";

const issuer = new PrismaClientIssuer();
const walletUseCase = createWalletUseCase(issuer);
const userUseCase = createUserUseCase(issuer);
const membershipUseCase = createMembershipUseCase(issuer);

const userResolver = {
  Query: {
    users: async (_: unknown, args: GqlQueryUsersArgs, ctx: IContext) =>
      userUseCase.visitorBrowseCommunityMembers(ctx, args),
    user: async (_: unknown, args: GqlQueryUserArgs, ctx: IContext) => {
      return userUseCase.visitorViewMember(ctx, args);
    },
  },
  Mutation: {
    userUpdateMyProfile: async (
      _: unknown,
      args: GqlMutationUserUpdateMyProfileArgs,
      ctx: IContext,
    ) => userUseCase.userUpdateProfile(ctx, args),
  },

  User: {
    portfolios: async (
      parent: GqlUser,
      args: GqlUserPortfoliosArgs,
      ctx: IContext,
    ): Promise<GqlPortfoliosConnection> => {
      return ViewUseCase.visitorBrowsePortfolios(
        {
          ...args,
          filter: {
            ...args.filter,
            userIds: [parent.id],
          },
        },
        ctx,
      );
    },

    articlesAboutMe: async (
      parent: GqlUser,
      args: GqlUserArticlesAboutMeArgs,
      ctx: IContext,
    ): Promise<GqlArticlesConnection> => {
      return ArticleUseCase.anyoneBrowseArticles(ctx, {
        ...args,
        filter: {
          ...args.filter,
          authors: [parent.id],
        },
      });
    },

    memberships: async (
      parent: GqlUser,
      args: GqlUserMembershipsArgs,
      ctx: IContext,
    ): Promise<GqlMembershipsConnection> => {
      return membershipUseCase.visitorBrowseMemberships(
        {
          ...args,
          filter: { ...args.filter, userId: parent.id },
        },
        ctx,
      );
    },

    wallets: async (
      parent: GqlUser,
      args: GqlUserWalletsArgs,
      ctx: IContext,
    ): Promise<GqlWalletsConnection> => {
      return walletUseCase.visitorBrowseWallets(
        {
          ...args,
          filter: { ...args.filter, userId: parent.id },
        },
        ctx,
      );
    },

    opportunitiesCreatedByMe: async (
      parent: GqlUser,
      args: GqlUserOpportunitiesCreatedByMeArgs,
      ctx: IContext,
    ): Promise<GqlOpportunitiesConnection> => {
      return OpportunityUseCase.anyoneBrowseOpportunities(
        {
          ...args,
          filter: { ...args.filter, createdByUserIds: [parent.id] },
        },
        ctx,
      );
    },

    participations: async (
      parent: GqlUser,
      args: GqlUserParticipationsArgs,
      ctx: IContext,
    ): Promise<GqlParticipationsConnection> => {
      return ParticipationUseCase.visitorBrowseParticipations(
        {
          filter: { userIds: [parent.id] },
          ...args,
        },
        ctx,
      );
    },

    participationStatusChangedByMe: async (
      parent: GqlUser,
      args: GqlUserParticipationStatusChangedByMeArgs,
      ctx: IContext,
    ): Promise<GqlParticipationStatusHistoriesConnection> => {
      return ParticipationStatusHistoryUseCase.visitorBrowseParticipationStatusChangedByUser(
        parent,
        args,
        ctx,
      );
    },
  },
};

export default userResolver;
