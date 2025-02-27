import { IContext } from "@/types/server";
import { GqlCurrentUserPayload, GqlMutationUserSignUpArgs } from "@/types/graphql";
import IdentityInputFormat from "@/presentation/graphql/dto/user/identity/input";
import IdentityService from "@/app/user/identity/service";
import IdentityResponseFormat from "@/presentation/graphql/dto/user/identity/output";

export default class IdentityUseCase {
  static async userViewCurrentAccount(context: IContext): Promise<GqlCurrentUserPayload> {
    return {
      user: context.currentUser,
    };
  }

  static async userCreateAccount(
    context: IContext,
    args: GqlMutationUserSignUpArgs,
  ): Promise<GqlCurrentUserPayload> {
    const data = IdentityInputFormat.create(args);
    const user = await IdentityService.createUserAndIdentity(data, context.uid, context.platform);
    return IdentityResponseFormat.create(user);
  }

  static async userDeleteAccount(context: IContext): Promise<GqlCurrentUserPayload> {
    const uid = context.uid;
    const user = await IdentityService.deleteUserAndIdentity(uid);
    await IdentityService.deleteFirebaseAuthUser(uid);
    return IdentityResponseFormat.delete(user);
  }
}
