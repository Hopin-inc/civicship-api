import { GqlMutationUserUpdateMyProfileArgs, GqlQueryUsersArgs } from "@/types/graphql";
import UserRepository from "@/domains/user/repository";
import { IContext } from "@/types/server";
import UserInputFormat from "@/domains/user/presenter/input";
import { Prisma } from "@prisma/client";

export default class UserService {
  static async fetchCommunityMembers(
    ctx: IContext,
    { cursor, filter, sort }: GqlQueryUsersArgs,
    take: number,
  ) {
    const where = UserInputFormat.filter(filter ?? {});
    const orderBy = UserInputFormat.sort(sort ?? {});
    return UserRepository.queryOnlyCommunity(ctx, where, orderBy, take, cursor);
  }

  static async findUser(ctx: IContext, id: string) {
    return await UserRepository.find(ctx, id);
  }

  static async updateProfile(ctx: IContext, { input }: GqlMutationUserUpdateMyProfileArgs) {
    const data: Prisma.UserUpdateInput = UserInputFormat.update(input);
    return UserRepository.updateProfile(ctx, ctx.uid, data);
  }
}
