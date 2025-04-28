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
import "reflect-metadata";
import { container } from "tsyringe";
import MembershipUseCase from "@/application/domain/account/membership/usecase";
import UserUseCase from "@/application/domain/account/user/usecase";
import WalletUseCase from "@/application/domain/account/wallet/usecase";

const userUseCase = container.resolve(UserUseCase);
const walletUseCase = container.resolve(WalletUseCase);
const membershipUseCase = container.resolve(MembershipUseCase);
const articleUseCase = container.resolve(ArticleUseCase);

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
      const useCase = container.resolve(ViewUseCase);
      return useCase.visitorBrowsePortfolios(
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
      return articleUseCase.anyoneBrowseArticles(ctx, {
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
      const opportunityUseCase = container.resolve(OpportunityUseCase);
      return opportunityUseCase.anyoneBrowseOpportunities(
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
      const participationUseCase = container.resolve(ParticipationUseCase);
      return participationUseCase.visitorBrowseParticipations(
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
      const participationStatusHistoryUseCase = container.resolve(
        ParticipationStatusHistoryUseCase,
      );
      return participationStatusHistoryUseCase.visitorBrowseParticipationStatusChangedByUser(
        parent,
        args,
        ctx,
      );
    },
  },
};

export default userResolver;
