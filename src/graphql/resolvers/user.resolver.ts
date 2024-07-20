import UserService from "@/services/user.service";
import {
  GqlMutationCreateUserArgs,
  GqlMutationDeleteUserArgs,
  GqlMutationUpdateUserArgs,
  GqlQueryUserArgs,
  GqlQueryUsersArgs,
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
    updateUser: async (_: unknown, args: GqlMutationUpdateUserArgs) =>
      UserService.updateUser(args),
    deleteUser: async (_: unknown, args: GqlMutationDeleteUserArgs) =>
      UserService.deleteUser(args),
  },
};

export default userResolver;
