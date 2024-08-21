import UserService from "@/services/user.service";
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

const userResolver = {
  Query: {
    users: async (_: unknown, args: GqlQueryUsersArgs) => UserService.queryUsers(args),
    user: async (_: unknown, args: GqlQueryUserArgs) => UserService.getUser(args),
  },
  Mutation: {
    userCreate: async (_: unknown, args: GqlMutationUserCreateArgs) => UserService.userCreate(args),
    userDelete: async (_: unknown, args: GqlMutationUserDeleteArgs) => UserService.userDelete(args),
    userUpdateContent: async (_: unknown, args: GqlMutationUserUpdateContentArgs) =>
      UserService.userUpdateContent(args),
    userPublish: async (_: unknown, args: GqlMutationUserPublishArgs) =>
      UserService.userPublish(args),
    userUnpublish: async (_: unknown, args: GqlMutationUserUnpublishArgs) =>
      UserService.userUnpublish(args),
    userAddGroup: async (_: unknown, args: GqlMutationUserAddGroupArgs) =>
      UserService.userAddGroup(args),
    userRemoveGroup: async (_: unknown, args: GqlMutationUserRemoveGroupArgs) =>
      UserService.userRemoveGroup(args),
    userAddOrganization: async (_: unknown, args: GqlMutationUserAddOrganizationArgs) =>
      UserService.userAddOrganization(args),
    userRemoveOrganization: async (_: unknown, args: GqlMutationUserRemoveOrganizationArgs) =>
      UserService.userRemoveOrganization(args),
    userAddActivity: async (_: unknown, args: GqlMutationUserAddActivityArgs) =>
      UserService.userAddActivity(args),
    userRemoveActivity: async (_: unknown, args: GqlMutationUserRemoveActivityArgs) =>
      UserService.userRemoveActivity(args),
  },
};

export default userResolver;
