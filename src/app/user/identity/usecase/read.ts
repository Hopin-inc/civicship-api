import { IContext } from "@/types/server";
import { GqlCurrentUserPayload } from "@/types/graphql";

export default class IdentityReadUseCase {
  static async userViewCurrentAccount(context: IContext): Promise<GqlCurrentUserPayload> {
    return {
      user: context.currentUser,
    };
  }
}
