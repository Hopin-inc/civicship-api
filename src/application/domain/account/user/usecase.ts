import {
  GqlMutationUserUpdateMyProfileArgs,
  GqlQueryUserArgs,
  GqlQueryUsersArgs,
  GqlUser,
  GqlUsersConnection,
  GqlUserUpdateProfilePayload,
} from "@/types/graphql";
import UserService from "@/application/domain/account/user/service";
import UserPresenter from "@/application/domain/account/user/presenter";
import { IContext } from "@/types/server";
import { clampFirst } from "@/application/domain/utils";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

export default class UserUseCase {
  private static issuer = new PrismaClientIssuer();

  static async visitorBrowseCommunityMembers(
    ctx: IContext,
    { cursor, filter, sort, first }: GqlQueryUsersArgs,
  ): Promise<GqlUsersConnection> {
    const take = clampFirst(first);
    const data = await UserService.fetchCommunityMembers(ctx, { cursor, filter, sort }, take);
    const hasNextPage = data.length > take;

    const users: GqlUser[] = data.slice(0, take).map((record) => {
      return UserPresenter.get(record);
    });
    return UserPresenter.query(users, hasNextPage);
  }

  static async visitorViewMember(ctx: IContext, { id }: GqlQueryUserArgs): Promise<GqlUser | null> {
    const user = await UserService.findUser(ctx, id);
    if (!user) {
      return null;
    }

    return UserPresenter.get(user);
  }

  static async userUpdateProfile(
    ctx: IContext,
    args: GqlMutationUserUpdateMyProfileArgs,
  ): Promise<GqlUserUpdateProfilePayload> {
    const user = await this.issuer.public(ctx, async (tx) => {
      return await UserService.updateProfile(ctx, args, tx);
    });

    return UserPresenter.updateProfile(user);
  }
}
