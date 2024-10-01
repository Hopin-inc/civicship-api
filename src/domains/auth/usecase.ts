import { IContext } from "@/types/server";
import { GqlCurrentUserPayload } from "@/types/graphql";
import AuthService from "@/domains/auth/service";

export default class AuthUseCase {
  static async userViewCurrentAccount(context: IContext): Promise<GqlCurrentUserPayload> {
    return {
      user: context.currentUser,
    };
  }

  static async userDeleteAccount(context: IContext): Promise<GqlCurrentUserPayload> {
    return AuthService.deleteUser(context.uid);
  }
}
