import UserUseCase from "@/domains/user/usecase";
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
import MembershipUseCase from "@/domains/membership/usecase";
import WalletUseCase from "@/domains/membership/wallet/usecase";
import OpportunityUseCase from "@/domains/opportunity/usecase";
import ParticipationUseCase from "@/domains/opportunity/participation/usecase";
import ParticipationStatusHistoryUseCase from "@/domains/opportunity/participation/statusHistory/usecase";

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
      return MembershipUseCase.visitorBrowseMembershipsByUser(parent, args, ctx);
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
      return OpportunityUseCase.visitorBrowseOpportunitiesCreatedByUser(parent, args, ctx);
    },

    participations: async (
      parent: GqlUser,
      args: GqlUserParticipationsArgs,
      ctx: IContext,
    ): Promise<GqlParticipationsConnection> => {
      return ParticipationUseCase.visitorBrowseParticipationsByUser(parent, args, ctx);
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
