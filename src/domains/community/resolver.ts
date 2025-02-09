import {
  GqlQueryCommunitiesArgs,
  GqlQueryCommunityArgs,
  GqlMutationCommunityCreateArgs,
  GqlMutationCommunityDeleteArgs,
  GqlMutationCommunityUpdateProfileArgs,
} from "@/types/graphql";
import CommunityUseCase from "@/domains/community/usecase";
import { IContext } from "@/types/server";

const communityResolver = {
  Query: {
    communities: async (_: unknown, args: GqlQueryCommunitiesArgs, ctx: IContext) =>
      CommunityUseCase.userBrowseCommunities(args, ctx),
    community: async (_: unknown, args: GqlQueryCommunityArgs, ctx: IContext) =>
      CommunityUseCase.userViewCommunity(args, ctx),
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
};

export default communityResolver;
