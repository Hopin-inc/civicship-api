import UserUseCase from "@/usecase/user.usecase";
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
    users: async (_: unknown, args: GqlQueryUsersArgs) => UserUseCase.userGetManyPublicUsers(args),
    user: async (_: unknown, args: GqlQueryUserArgs) => UserUseCase.userGetUser(args),
  },
  Mutation: {
    userCreate: async (_: unknown, args: GqlMutationUserCreateArgs) =>
      UserUseCase.userCreateUser(args),
    userDelete: async (_: unknown, args: GqlMutationUserDeleteArgs) =>
      UserUseCase.userDeleteUser(args),
    userUpdateContent: async (_: unknown, args: GqlMutationUserUpdateContentArgs) =>
      UserUseCase.userUpdateUserContent(args),
    userPublish: async (_: unknown, args: GqlMutationUserPublishArgs) =>
      UserUseCase.userPublishUser(args),
    userUnpublish: async (_: unknown, args: GqlMutationUserUnpublishArgs) =>
      UserUseCase.userUnpublishUser(args),
    userAddGroup: async (_: unknown, args: GqlMutationUserAddGroupArgs) =>
      UserUseCase.userAddGroupToUser(args),
    userRemoveGroup: async (_: unknown, args: GqlMutationUserRemoveGroupArgs) =>
      UserUseCase.userRemoveGroupFromUser(args),
    userAddOrganization: async (_: unknown, args: GqlMutationUserAddOrganizationArgs) =>
      UserUseCase.userAddOrganizationToUser(args),
    userRemoveOrganization: async (_: unknown, args: GqlMutationUserRemoveOrganizationArgs) =>
      UserUseCase.userRemoveOrganizationFromUser(args),
    userAddActivity: async (_: unknown, args: GqlMutationUserAddActivityArgs) =>
      UserUseCase.userAddActivityToUser(args),
    userRemoveActivity: async (_: unknown, args: GqlMutationUserRemoveActivityArgs) =>
      UserUseCase.userRemoveActivityFromUser(args),
  },
};

export default userResolver;
