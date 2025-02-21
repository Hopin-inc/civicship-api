import { IContext } from "@/types/server";
import { GqlUserFilterInput, GqlUserSortInput, GqlUsersConnection, GqlUser } from "@/types/graphql";
import { clampFirst } from "@/utils";
import UserService from "@/app/user/service";
import UserOutputFormat from "@/presentation/graphql/dto/user/output";

export default class UserUtils {
  static async fetchUsersCommon(
    ctx: IContext,
    {
      cursor,
      filter,
      sort,
      first,
    }: {
      cursor?: string;
      filter?: GqlUserFilterInput;
      sort?: GqlUserSortInput;
      first?: number;
    },
  ): Promise<GqlUsersConnection> {
    const take = clampFirst(first);

    const res = await UserService.fetchUsers(ctx, { cursor, filter, sort }, take);
    const hasNextPage = res.length > take;

    const data: GqlUser[] = res.slice(0, take).map((record) => {
      return UserOutputFormat.get(record);
    });

    return UserOutputFormat.query(data, hasNextPage);
  }
}
