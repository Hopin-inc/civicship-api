import UserUseCase from "@/domains/user/usecase";
import {
  GqlQueryUserArgs,
  GqlQueryUsersArgs,
  GqlMutationUserUpdateContentArgs,
  GqlMutationUserCreateArgs,
  GqlMutationUserDeleteArgs,
  GqlMutationUserPublishArgs,
  GqlMutationUserUnpublishArgs,
  GqlMutationUserAddActivityArgs,
  GqlMutationUserAddGroupArgs,
  GqlMutationUserRemoveGroupArgs,
  GqlMutationUserAddOrganizationArgs,
  GqlMutationUserRemoveOrganizationArgs,
  GqlMutationUserRemoveActivityArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";

const userResolver = {
  Query: {
    // users: async (_: unknown, args: GqlQueryUsersArgs, ctx: IContext) => UserUseCase.userGetManyPublicUsers(ctx, args),
    users: async (_: unknown, args: GqlQueryUsersArgs, ctx: IContext) => UserUseCase.userGetManyOrganizationUsers(ctx, args),
    user: async (_: unknown, args: GqlQueryUserArgs, ctx: IContext) => UserUseCase.userGetUser(ctx, args),
  },
  Mutation: {
    userCreate: async (_: unknown, args: GqlMutationUserCreateArgs, ctx: IContext) =>
      UserUseCase.userCreateUser(ctx, args),
    userDelete: async (_: unknown, args: GqlMutationUserDeleteArgs, ctx: IContext) =>
      UserUseCase.userDeleteUser(ctx, args),
    userUpdateContent: async (_: unknown, args: GqlMutationUserUpdateContentArgs, ctx: IContext) =>
      UserUseCase.userUpdateUserContent(ctx, args),
    userPublish: async (_: unknown, args: GqlMutationUserPublishArgs, ctx: IContext) =>
      UserUseCase.userPublishUser(ctx, args),
    userUnpublish: async (_: unknown, args: GqlMutationUserUnpublishArgs, ctx: IContext) =>
      UserUseCase.userUnpublishUser(ctx, args),
    userAddGroup: async (_: unknown, args: GqlMutationUserAddGroupArgs, ctx: IContext) =>
      UserUseCase.userAddGroupToUser(ctx, args),
    userRemoveGroup: async (_: unknown, args: GqlMutationUserRemoveGroupArgs, ctx: IContext) =>
      UserUseCase.userRemoveGroupFromUser(ctx, args),
    userAddOrganization: async (_: unknown, args: GqlMutationUserAddOrganizationArgs, ctx: IContext) =>
      UserUseCase.userAddOrganizationToUser(ctx, args),
    userRemoveOrganization: async (_: unknown, args: GqlMutationUserRemoveOrganizationArgs, ctx: IContext) =>
      UserUseCase.userRemoveOrganizationFromUser(ctx, args),
    userAddActivity: async (_: unknown, args: GqlMutationUserAddActivityArgs, ctx: IContext) =>
      UserUseCase.userAddActivityToUser(ctx, args),
    userRemoveActivity: async (_: unknown, args: GqlMutationUserRemoveActivityArgs, ctx: IContext) =>
      UserUseCase.userRemoveActivityFromUser(ctx, args),
  },
};

export default userResolver;
