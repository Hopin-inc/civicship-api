import UserReadUseCase from "@/app/user/usecase/read";
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
import WalletReadUseCase from "@/app/membership/wallet/usecase/read";
import ParticipationReadUseCase from "@/app/opportunity/participation/usecase/read";
import ParticipationStatusHistoryReadUseCase from "@/app/opportunity/participation/statusHistory/usecase/read";
import OpportunityReadUseCase from "@/app/opportunity/usecase/read";
import UserWriteUseCase from "@/app/user/usecase/write";
import MembershipReadUseCase from "@/app/membership/usecase/read";

const userResolver = {
  Query: {
    users: async (_: unknown, args: GqlQueryUsersArgs, ctx: IContext) =>
      UserReadUseCase.visitorBrowseCommunityMembers(ctx, args),
    user: async (_: unknown, args: GqlQueryUserArgs, ctx: IContext) => {
      if (!ctx.loaders?.user) {
        return UserReadUseCase.visitorViewMember(ctx, args);
      }
      return await ctx.loaders.user.load(args.id);
    },
  },
  Mutation: {
    userUpdateMyProfile: async (
      _: unknown,
      args: GqlMutationUserUpdateMyProfileArgs,
      ctx: IContext,
    ) => UserWriteUseCase.userUpdateProfile(ctx, args),
  },

  User: {
    memberships: async (
      parent: GqlUser,
      args: GqlUserMembershipsArgs,
      ctx: IContext,
    ): Promise<GqlMembershipsConnection> => {
      return MembershipReadUseCase.visitorBrowseMembershipsByUser(parent, args, ctx);
    },

    wallets: async (
      parent: GqlUser,
      args: GqlUserWalletsArgs,
      ctx: IContext,
    ): Promise<GqlWalletsConnection> => {
      return WalletReadUseCase.visitorBrowseWalletsByUser(parent, args, ctx);
    },

    opportunitiesCreatedByMe: async (
      parent: GqlUser,
      args: GqlUserOpportunitiesCreatedByMeArgs,
      ctx: IContext,
    ): Promise<GqlOpportunitiesConnection> => {
      return OpportunityReadUseCase.visitorBrowseOpportunitiesCreatedByUser(parent, args, ctx);
    },

    participations: async (
      parent: GqlUser,
      args: GqlUserParticipationsArgs,
      ctx: IContext,
    ): Promise<GqlParticipationsConnection> => {
      return ParticipationReadUseCase.visitorBrowseParticipationsByUser(parent, args, ctx);
    },

    participationStatusChangedByMe: async (
      parent: GqlUser,
      args: GqlUserParticipationStatusChangedByMeArgs,
      ctx: IContext,
    ): Promise<GqlParticipationStatusHistoriesConnection> => {
      return ParticipationStatusHistoryReadUseCase.visitorBrowseParticipationStatusChangedByUser(
        parent,
        args,
        ctx,
      );
    },
  },
};

export default userResolver;
