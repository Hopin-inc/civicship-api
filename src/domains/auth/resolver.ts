import { IContext } from "@/types/server";
import AuthUseCase from "@/domains/auth/usecase";

const authResolver = {
  Query: {
    currentUser: async (_: unknown, __: unknown, ctx: IContext, ___: unknown) =>
      AuthUseCase.userViewCurrentAccount(ctx),
  },
  Mutation: {
    deleteUser: async (_: unknown, __: unknown, ctx: IContext, ___: unknown) =>
      AuthUseCase.userDeleteAccount(ctx),
  }
};

export default authResolver;
