import { IContext } from "@/types/server";
import IdentityUseCase from "@/domains/user/identity/usecase";
import { GqlMutationUserSignUpArgs } from "@/types/graphql";

const identityResolver = {
  Query: {
    currentUser: async (_: unknown, __: unknown, ctx: IContext) =>
      IdentityUseCase.userViewCurrentAccount(ctx),
  },
  Mutation: {
    userSignUp: async (_: unknown, args: GqlMutationUserSignUpArgs, ctx: IContext) =>
      IdentityUseCase.userCreateAccount(ctx, args),
    userDeleteMe: async (_: unknown, __: unknown, ctx: IContext) =>
      IdentityUseCase.userDeleteAccount(ctx),
  },
};

export default identityResolver;
