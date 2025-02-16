import { GqlQueryUserArgs, GqlQueryUsersArgs, GqlUser, GqlUsersConnection } from "@/types/graphql";
import UserService from "@/application/user/service";
import UserResponseFormat from "@/presentation/graphql/dto/user/output";
import { IContext } from "@/types/server";
import { clampFirst } from "@/utils";

export default class UserReadUseCase {
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
}
