import UserUseCase from "@/domains/user/usecase";
import {
  GqlQueryUserArgs,
  GqlMutationUserUpdateProfileArgs,
  GqlQueryUsersArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";

const userResolver = {
  Query: {
    users: async (_: unknown, args: GqlQueryUsersArgs, ctx: IContext) =>
      UserUseCase.visitorBrowseCommunityMembers(ctx, args),
    user: async (_: unknown, args: GqlQueryUserArgs, ctx: IContext) =>
      UserUseCase.visitorViewMember(ctx, args),
  },
  Mutation: {
    userUpdateProfile: async (_: unknown, args: GqlMutationUserUpdateProfileArgs, ctx: IContext) =>
      UserUseCase.userUpdateProfile(ctx, args),
  },
};

export default userResolver;
