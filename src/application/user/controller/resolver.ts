import {
  GqlMembershipsConnection,
  GqlMutationUserUpdateMyProfileArgs,
  GqlOpportunitiesConnection,
  GqlParticipationsConnection,
  GqlParticipationStatusHistoriesConnection,
  GqlQueryUserArgs,
  GqlQueryUsersArgs,
  GqlUser,
  GqlUserMembershipsArgs,
  GqlUserOpportunitiesCreatedByMeArgs,
  GqlUserParticipationsArgs,
  GqlUserParticipationStatusChangedByMeArgs,
  GqlUserWalletsArgs,
  GqlWalletsConnection,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import UserUseCase from "@/application/user/usecase";
import MembershipUseCase from "@/application/membership/usecase";
import WalletUseCase from "@/application/membership/wallet/usecase";
import OpportunityUseCase from "@/application/opportunity/usecase";
import ParticipationUseCase from "@/application/participation/usecase";
import ParticipationStatusHistoryUseCase from "@/application/participation/statusHistory/usecase";

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
      return WalletUseCase.visitorBrowseWalletsByUser(parent, args, ctx);
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
          filter: { userId: parent.id },
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
