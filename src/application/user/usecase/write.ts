import { GqlMutationUserUpdateMyProfileArgs, GqlUserUpdateProfilePayload } from "@/types/graphql";
import UserService from "@/application/user/service";
import UserResponseFormat from "@/presentation/graphql/dto/user/output";
import { IContext } from "@/types/server";

export default class UserWriteUseCase {
  static async userUpdateProfile(
    ctx: IContext,
    { input }: GqlMutationUserUpdateMyProfileArgs,
  ): Promise<GqlUserUpdateProfilePayload> {
    const res = await UserService.updateProfile(ctx, { input });
    return UserResponseFormat.updateProfile(res);
  }
}
