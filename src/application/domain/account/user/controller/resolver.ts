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

const userResolver = {
  Query: {
    users: async (_: unknown, args: GqlQueryUsersArgs, ctx: IContext) => {
      const usecase = container.resolve(UserUseCase);
      return usecase.visitorBrowseCommunityMembers(ctx, args);
    },
    user: async (_: unknown, args: GqlQueryUserArgs, ctx: IContext) => {
      const usecase = container.resolve(UserUseCase);
      return usecase.visitorViewMember(ctx, args);
    },
  },
  Mutation: {
    userUpdateMyProfile: async (
      _: unknown,
      args: GqlMutationUserUpdateMyProfileArgs,
      ctx: IContext,
    ) => {
      const usecase = container.resolve(UserUseCase);
      return usecase.userUpdateProfile(ctx, args);
    },
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
      const usecase = container.resolve(ArticleUseCase);
      return usecase.anyoneBrowseArticles(ctx, {
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
      const usecase = container.resolve(MembershipUseCase);
      return usecase.visitorBrowseMemberships(
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
      const usecase = container.resolve(WalletUseCase);
      return usecase.visitorBrowseWallets(
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
      const usecase = container.resolve(OpportunityUseCase);
      return usecase.anyoneBrowseOpportunities(
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
      const usecase = container.resolve(ParticipationUseCase);
      return usecase.visitorBrowseParticipations(
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
      const usecase = container.resolve(ParticipationStatusHistoryUseCase);
      return usecase.visitorBrowseParticipationStatusChangedByUser(parent, args, ctx);
    },
  },
};

export default userResolver;
