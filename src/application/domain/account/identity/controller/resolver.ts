import { IContext } from "@/types/server";
import { GqlMutationUserSignUpArgs } from "@/types/graphql";
import { createIdentityUseCase } from "@/application/domain/account/identity/provider";

const identityUseCase = createIdentityUseCase();

const identityResolver = {
  Query: {
    currentUser: async (_: unknown, __: unknown, ctx: IContext) =>
      identityUseCase.userViewCurrentAccount(ctx),
  },
  Mutation: {
    userSignUp: async (_: unknown, args: GqlMutationUserSignUpArgs, ctx: IContext) =>
      identityUseCase.userCreateAccount(ctx, args),
    userDeleteMe: async (_: unknown, __: unknown, ctx: IContext) =>
      identityUseCase.userDeleteAccount(ctx),
  },
};

export default identityResolver;
