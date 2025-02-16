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
import UtilityReadUseCase from "@/application/utility/usecase/read";
import WalletReadUseCase from "@/application/membership/wallet/usecase/read";
import ParticipationReadUseCase from "@/application/opportunity/participation/usecase/read";
import CommunityReadUseCase from "@/application/community/usecase/read";
import CommunityWriteUseCase from "@/application/community/usecase/write";
import MembershipReadUseCase from "@/application/membership/usecase/read";
import OpportunityReadUseCase from "@/application/opportunity/usecase/read";

const communityResolver = {
  Query: {
    communities: async (_: unknown, args: GqlQueryCommunitiesArgs, ctx: IContext) =>
      CommunityReadUseCase.userBrowseCommunities(args, ctx),
    community: async (_: unknown, args: GqlQueryCommunityArgs, ctx: IContext) => {
      if (!ctx.loaders?.community) {
        return CommunityReadUseCase.userViewCommunity(args, ctx);
      }
      return await ctx.loaders.community.load(args.id);
    },
  },
  Mutation: {
    communityCreate: async (_: unknown, args: GqlMutationCommunityCreateArgs, ctx: IContext) =>
      CommunityWriteUseCase.userCreateCommunityAndJoin(args, ctx),
    communityDelete: async (_: unknown, args: GqlMutationCommunityDeleteArgs, ctx: IContext) =>
      CommunityWriteUseCase.managerDeleteCommunity(args, ctx),
    communityUpdateProfile: async (
      _: unknown,
      args: GqlMutationCommunityUpdateProfileArgs,
      ctx: IContext,
    ) => CommunityWriteUseCase.managerUpdateCommunityProfile(args, ctx),
  },
  Community: {
    memberships: async (
      parent: GqlCommunity,
      args: GqlCommunityMembershipsArgs,
      ctx: IContext,
    ): Promise<GqlMembershipsConnection> => {
      return MembershipReadUseCase.visitorBrowseMembershipsByCommunity(parent, args, ctx);
    },

    opportunities: async (
      parent: GqlCommunity,
      args: GqlCommunityOpportunitiesArgs,
      ctx: IContext,
    ): Promise<GqlOpportunitiesConnection> => {
      return OpportunityReadUseCase.visitorBrowseOpportunitiesByCommunity(parent, args, ctx);
    },

    participations: async (
      parent: GqlCommunity,
      args: GqlCommunityParticipationsArgs,
      ctx: IContext,
    ): Promise<GqlParticipationsConnection> => {
      return ParticipationReadUseCase.visitorBrowseParticipationsByCommunity(parent, args, ctx);
    },

    wallets: async (
      parent: GqlCommunity,
      args: GqlCommunityWalletsArgs,
      ctx: IContext,
    ): Promise<GqlWalletsConnection> => {
      return WalletReadUseCase.visitorBrowseWalletsByCommunity(parent, args, ctx);
    },

    utilities: async (
      parent: GqlCommunity,
      args: GqlCommunityUtilitiesArgs,
      ctx: IContext,
    ): Promise<GqlUtilitiesConnection> => {
      return UtilityReadUseCase.visitorBrowseUtilitiesByCommunity(parent, args, ctx);
    },
  },
};

export default communityResolver;
