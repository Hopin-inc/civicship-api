import { IContext } from "@/types/server";
import { GqlMutationUserSignUpArgs } from "@/types/graphql";
import IdentityUseCase from "@/application/identity/usecase";

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
