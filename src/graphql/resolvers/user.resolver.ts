import UserService from "@/services/user.service";
import {
  GqlMutationCreateUserArgs,
  GqlMutationDeleteUserArgs,
  GqlQueryUserArgs,
  GqlQueryUsersArgs,
  GqlMutationUpdateUserProfileArgs,
  GqlMutationUpdateUserPrivacyArgs,
  GqlMutationAddGroupToUserArgs,
  GqlMutationRemoveGroupFromUserArgs,
  GqlMutationAddOrganizationToUserArgs,
  GqlMutationRemoveOrganizationFromUserArgs,
  GqlMutationAddActivityToUserArgs,
  GqlMutationRemoveActivityFromUserArgs,
} from "@/types/graphql";

const userResolver = {
  Query: {
    users: async (_: unknown, args: GqlQueryUsersArgs) =>
      UserService.queryUsers(args),
    user: async (_: unknown, args: GqlQueryUserArgs) =>
      UserService.getUser(args),
  },
  Mutation: {
    createUser: async (_: unknown, args: GqlMutationCreateUserArgs) =>
      UserService.createUser(args),
    deleteUser: async (_: unknown, args: GqlMutationDeleteUserArgs) =>
      UserService.deleteUser(args),
    updateUserProfile: async (
      _: unknown,
      args: GqlMutationUpdateUserProfileArgs,
    ) => UserService.updateUserProfile(args),
    updateUserPrivacy: async (
      _: unknown,
      args: GqlMutationUpdateUserPrivacyArgs,
    ) => UserService.updateUserPrivacy(args),
    addGroupToUser: async (_: unknown, args: GqlMutationAddGroupToUserArgs) =>
      UserService.addGroupToUser(args),
    // deleteGroupFromUser: async (
    //   _: unknown,
    //   args: GqlMutationRemoveGroupFromUserArgs,
    // ) => UserService.removeGroupFromUser(args),
    addOrganizationToUser: async (
      _: unknown,
      args: GqlMutationAddOrganizationToUserArgs,
    ) => UserService.addOrganizationToUser(args),
    // deleteOrganizationFromUser: async (
    //   _: unknown,
    //   args: GqlMutationRemoveOrganizationFromUserArgs,
    // ) => UserService.removeOrganizationFromUser(args),
    addActivityToUser: async (
      _: unknown,
      args: GqlMutationAddActivityToUserArgs,
    ) => UserService.addActivityToUser(args),
    // deleteActivityFromUser: async (
    //   _: unknown,
    //   args: GqlMutationRemoveActivityFromUserArgs,
    // ) => UserService.removeActivityFromUser(args),
  },
};

export default userResolver;
