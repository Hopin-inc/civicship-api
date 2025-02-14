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
import CommunityUseCase from "@/domains/community/usecase";
import { IContext } from "@/types/server";
import UtilityUseCase from "@/domains/utility/usecase";
import MembershipUseCase from "@/domains/membership/usecase";
import OpportunityUseCase from "@/domains/opportunity/usecase";
import WalletUseCase from "@/domains/membership/wallet/usecase";
import ParticipationUseCase from "@/domains/opportunity/participation/usecase";

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
      CommunityUseCase.userCreateCommunity(args, ctx),
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
