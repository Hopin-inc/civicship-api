import {
  GqlMutationUserUpdateMyProfileArgs,
  GqlQueryUserArgs,
  GqlQueryUsersArgs,
  GqlUser,
  GqlUsersConnection,
  GqlUserUpdateProfilePayload,
} from "@/types/graphql";
import UserService from "@/app/user/service";
import UserResponseFormat from "@/presentation/graphql/dto/user/output";
import { IContext } from "@/types/server";
import { clampFirst } from "@/utils";

export default class UserUseCase {
  static async visitorBrowseCommunityMembers(
    ctx: IContext,
    { cursor, filter, sort, first }: GqlQueryUsersArgs,
  ): Promise<GqlUsersConnection> {
    const take = clampFirst(first);
    const data = await UserService.fetchCommunityMembers(ctx, { cursor, filter, sort }, take);
    const hasNextPage = data.length > take;

    const users: GqlUser[] = data.slice(0, take).map((record) => {
      return UserResponseFormat.get(record);
    });
    return UserResponseFormat.query(users, hasNextPage);
  }

  static async visitorViewMember(ctx: IContext, { id }: GqlQueryUserArgs): Promise<GqlUser | null> {
    const user = await UserService.findUser(ctx, id);
    if (!user) {
      return null;
    }
    return UserResponseFormat.get(user);
  }

  static async userUpdateProfile(
    ctx: IContext,
    { input }: GqlMutationUserUpdateMyProfileArgs,
  ): Promise<GqlUserUpdateProfilePayload> {
    const res = await UserService.updateProfile(ctx, { input });
    return UserResponseFormat.updateProfile(res);
  }
}
