import { IContext } from "@/types/server";
import { GqlMutationUserSignUpArgs } from "@/types/graphql";
import "reflect-metadata";
import { container } from "tsyringe";
import IdentityUseCase from "@/application/domain/account/identity/usecase";

const identityResolver = {
  Query: {
    currentUser: async (_: unknown, __: unknown, ctx: IContext) => {
      const usecase = container.resolve(IdentityUseCase);
      return usecase.userViewCurrentAccount(ctx);
    },
  },
  Mutation: {
    userSignUp: async (_: unknown, args: GqlMutationUserSignUpArgs, ctx: IContext) => {
      const usecase = container.resolve(IdentityUseCase);
      return usecase.userCreateAccount(ctx, args);
    },
    userDeleteMe: async (_: unknown, __: unknown, ctx: IContext) => {
      const usecase = container.resolve(IdentityUseCase);
      return usecase.userDeleteAccount(ctx);
    },
  },
};

export default identityResolver;
