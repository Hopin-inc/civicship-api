import { IContext } from "@/types/server";
import { GqlCurrentUserPayload, GqlMutationUserSignUpArgs } from "@/types/graphql";
import IdentityService from "@/app/user/identity/service";
import IdentityInputFormat from "@/presen/graphql/dto/user/identity/input";
import IdentityResponseFormat from "@/presen/graphql/dto/user/identity/output";

export default class IdentityWriteUseCase {
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
