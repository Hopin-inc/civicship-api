import { IContext } from "@/types/server";
import { GqlCurrentUserPayload, GqlMutationCreateUserArgs } from "@/types/graphql";
import IdentityService from "@/domains/identity/service";
import IdentityInputFormat from "@/domains/identity/presenter/input";
import IdentityResponseFormat from "@/domains/identity/presenter/response";

export default class IdentityUseCase {
  static async userViewCurrentAccount(context: IContext): Promise<GqlCurrentUserPayload> {
    return {
      user: context.currentUser,
    };
  }

  static async userCreateAccount(context: IContext, args: GqlMutationCreateUserArgs): Promise<GqlCurrentUserPayload> {
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
