import { IContext } from "@/types/server";
import IdentityUseCase from "@/domains/user/identity/usecase";
import { GqlMutationCreateUserArgs } from "@/types/graphql";

const identityResolver = {
  Query: {
    currentUser: async (_: unknown, __: unknown, ctx: IContext) =>
      IdentityUseCase.userViewCurrentAccount(ctx),
  },
  Mutation: {
    createUser: async (_: unknown, args: GqlMutationCreateUserArgs, ctx: IContext) =>
      IdentityUseCase.userCreateAccount(ctx, args),
    deleteUser: async (_: unknown, __: unknown, ctx: IContext) =>
      IdentityUseCase.userDeleteAccount(ctx),
  },
};

export default identityResolver;
