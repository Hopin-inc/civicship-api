import { GqlMutationUserUpdateMyProfileArgs, GqlQueryUsersArgs } from "@/types/graphql";
import UserRepository from "@/application/user/data/repository";
import { IContext } from "@/types/server";
import UserConverter from "@/application/user/data/converter";
import { Prisma } from "@prisma/client";

export default class UserService {
  static async fetchUsers(
    ctx: IContext,
    { cursor, filter, sort }: GqlQueryUsersArgs,
    take: number,
  ) {
    const where = UserConverter.filter(filter ?? {});
    const orderBy = UserConverter.sort(sort ?? {});
    return UserRepository.query(ctx, where, orderBy, take, cursor);
  }

  static async fetchCommunityMembers(
    ctx: IContext,
    { cursor, filter, sort }: GqlQueryUsersArgs,
    take: number,
  ) {
    const where = UserConverter.filter(filter ?? {});
    const orderBy = UserConverter.sort(sort ?? {});
    return UserRepository.query(ctx, where, orderBy, take, cursor);
  }

  static async findUser(ctx: IContext, id: string) {
    return await UserRepository.find(ctx, id);
  }

  static async updateProfile(ctx: IContext, { input }: GqlMutationUserUpdateMyProfileArgs) {
    const data: Prisma.UserUpdateInput = UserConverter.update(input);
    return UserRepository.updateProfile(ctx, ctx.uid, data);
  }
}
