import { injectable, inject } from "tsyringe";
import { IContext } from "@/types/server";
import {
  GqlMutationUserSignUpArgs,
  GqlMutationLinkPhoneAuthArgs,
  GqlMutationStorePhoneAuthTokenArgs,
  GqlMutationIdentityCheckPhoneUserArgs
} from "@/types/graphql";
import IdentityUseCase from "@/application/domain/account/identity/usecase";
import { PrismaIdentityDetail } from "@/application/domain/account/identity/data/type";

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
    linkPhoneAuth: (_: unknown, args: GqlMutationLinkPhoneAuthArgs, ctx: IContext) => {
      return this.usecase.linkPhoneAuth(ctx, args.input.phoneUid, args.permission?.userId);
    },
    storePhoneAuthToken: (_: unknown, args: GqlMutationStorePhoneAuthTokenArgs, ctx: IContext) => {
      return this.usecase.storePhoneAuthToken(
        ctx,
        args.input.phoneUid,
        args.input.authToken,
        args.input.refreshToken,
        args.input.expiresIn
      );
    },
    identityCheckPhoneUser: (_: unknown, args: GqlMutationIdentityCheckPhoneUserArgs, ctx: IContext) => {
      return this.usecase.checkPhoneUser(ctx, args);
    },
  };

  Identity = {
    user: (parent: PrismaIdentityDetail, _: unknown, ctx: IContext) => {
      return parent.userId ? ctx.loaders.user.load(parent.userId) : null;
    },
  };
}
