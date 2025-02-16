import { IContext } from "@/types/server";
import IdentityReadUseCase from "@/app/user/identity/usecase/read";
import { GqlMutationUserSignUpArgs } from "@/types/graphql";
import IdentityWriteUseCase from "@/app/user/identity/usecase/write";

const identityResolver = {
  Query: {
    currentUser: async (_: unknown, __: unknown, ctx: IContext) =>
      IdentityReadUseCase.userViewCurrentAccount(ctx),
  },
  Mutation: {
    userSignUp: async (_: unknown, args: GqlMutationUserSignUpArgs, ctx: IContext) =>
      IdentityWriteUseCase.userCreateAccount(ctx, args),
    userDeleteMe: async (_: unknown, __: unknown, ctx: IContext) =>
      IdentityWriteUseCase.userDeleteAccount(ctx),
  },
};

export default identityResolver;
