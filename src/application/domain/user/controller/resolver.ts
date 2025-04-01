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
import UserUseCase from "@/application/domain/user/usecase";
import MembershipUseCase from "@/application/domain/membership/usecase";
import WalletUseCase from "@/application/domain/membership/wallet/usecase";
import OpportunityUseCase from "@/application/domain/opportunity/usecase";
import ParticipationUseCase from "@/application/domain/participation/usecase";
import ParticipationStatusHistoryUseCase from "@/application/domain/participation/statusHistory/usecase";
import ViewUseCase from "@/application/view/usecase";
import ArticleUseCase from "@/application/domain/article/usecase";

const userResolver = {
  Query: {
    users: async (_: unknown, args: GqlQueryUsersArgs, ctx: IContext) =>
      UserUseCase.visitorBrowseCommunityMembers(ctx, args),
    user: async (_: unknown, args: GqlQueryUserArgs, ctx: IContext) => {
      if (!ctx.loaders?.user) {
        return UserUseCase.visitorViewMember(ctx, args);
      }
      return await ctx.loaders.user.load(args.id);
    },
  },
  Mutation: {
    userUpdateMyProfile: async (
      _: unknown,
      args: GqlMutationUserUpdateMyProfileArgs,
      ctx: IContext,
    ) => UserUseCase.userUpdateProfile(ctx, args),
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
      return MembershipUseCase.visitorBrowseMemberships(
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
      return WalletUseCase.visitorBrowseWallets(
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
