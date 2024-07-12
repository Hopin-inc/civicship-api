import UserService from "@/services/user.service";
import {
  GqlMutationCreateUserArgs
} from "@/types/graphql";

const userResolver = {
  Query: {},
  Mutation: {
    createUser: async (_: unknown, args: GqlMutationCreateUserArgs) => UserService.createUser(args)
  }
};

export default userResolver;
