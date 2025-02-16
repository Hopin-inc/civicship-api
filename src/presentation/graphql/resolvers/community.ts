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
} from "@/types/graphql";
import { IContext } from "@/types/server";
import ParticipationUseCase from "@/app/opportunity/participation/usecase";
import WalletUseCase from "@/app/membership/wallet/usecase";
import CommunityUseCase from "@/app/community/usecase";
import MembershipUseCase from "@/app/membership/usecase";
import OpportunityUseCase from "@/app/opportunity/usecase";
import UtilityUseCase from "@/app/utility/usecase";

const communityResolver = {
  Query: {
    communities: async (_: unknown, args: GqlQueryCommunitiesArgs, ctx: IContext) =>
      CommunityUseCase.userBrowseCommunities(args, ctx),
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
      return MembershipUseCase.visitorBrowseMembershipsByCommunity(parent, args, ctx);
    },

    opportunities: async (
      parent: GqlCommunity,
      args: GqlCommunityOpportunitiesArgs,
      ctx: IContext,
    ): Promise<GqlOpportunitiesConnection> => {
      return OpportunityUseCase.visitorBrowseOpportunitiesByCommunity(parent, args, ctx);
    },

    participations: async (
      parent: GqlCommunity,
      args: GqlCommunityParticipationsArgs,
      ctx: IContext,
    ): Promise<GqlParticipationsConnection> => {
      return ParticipationUseCase.visitorBrowseParticipationsByCommunity(parent, args, ctx);
    },

    wallets: async (
      parent: GqlCommunity,
      args: GqlCommunityWalletsArgs,
      ctx: IContext,
    ): Promise<GqlWalletsConnection> => {
      return WalletUseCase.visitorBrowseWalletsByCommunity(parent, args, ctx);
    },

    utilities: async (
      parent: GqlCommunity,
      args: GqlCommunityUtilitiesArgs,
      ctx: IContext,
    ): Promise<GqlUtilitiesConnection> => {
      return UtilityUseCase.visitorBrowseUtilitiesByCommunity(parent, args, ctx);
    },
  },
};

export default communityResolver;
