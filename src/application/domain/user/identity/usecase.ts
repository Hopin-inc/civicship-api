import { IContext } from "@/types/server";
import { GqlCurrentUserPayload, GqlMutationUserSignUpArgs } from "@/types/graphql";
import IdentityConverter from "@/application/domain/user/identity/data/converter";
import IdentityService from "@/application/domain/user/identity/service";
import IdentityPresenter from "@/application/domain/user/identity/presenter";

export default class IdentityUseCase {
  static async userViewCurrentAccount(context: IContext): Promise<GqlCurrentUserPayload> {
    return {
      user: context.currentUser,
    };
  }

  static async userCreateAccount(
    ctx: IContext,
    args: GqlMutationUserSignUpArgs,
  ): Promise<GqlCurrentUserPayload> {
    const data = IdentityConverter.create(args);
    const user = await IdentityService.createUserAndIdentity(data, ctx.uid, ctx.platform);

    return IdentityPresenter.create(user);
  }

  static async userDeleteAccount(context: IContext): Promise<GqlCurrentUserPayload> {
    const uid = context.uid;
    const user = await IdentityService.deleteUserAndIdentity(uid);
    await IdentityService.deleteFirebaseAuthUser(uid);
    return IdentityPresenter.delete(user);
  }
}
