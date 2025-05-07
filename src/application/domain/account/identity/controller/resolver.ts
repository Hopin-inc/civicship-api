import { injectable, inject } from "tsyringe";
import { IContext } from "@/types/server";
import { GqlMutationUserSignUpArgs } from "@/types/graphql";
import IdentityUseCase from "@/application/domain/account/identity/usecase";

@injectable()
export default class IdentityResolver {
  constructor(@inject("IdentityUseCase") private readonly usecase: IdentityUseCase) {}

  Query = {
    currentUser: (_: unknown, __: unknown, ctx: IContext) => {
      return this.usecase.userViewCurrentAccount(ctx);
    },
  };

  Mutation = {
    userSignUp: (_: unknown, args: GqlMutationUserSignUpArgs, ctx: IContext) => {
      return this.usecase.userCreateAccount(ctx, args);
    },
    userDeleteMe: (_: unknown, __: unknown, ctx: IContext) => {
      return this.usecase.userDeleteAccount(ctx);
    },
  };

  Identity = {
    user: (parent: any, _: unknown, ctx: IContext) => {
      return parent.userId ? ctx.loaders.user.load(parent.userId) : null;
    },
  };
}
