import { GqlMutationUserUpdateMyProfileArgs, GqlQueryUsersArgs } from "@/types/graphql";
import UserRepository from "@/application/domain/user/data/repository";
import { IContext } from "@/types/server";
import UserConverter from "@/application/domain/user/data/converter";
import { Prisma } from "@prisma/client";
import { PrismaUser } from "@/application/domain/user/data/type";

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

  static async hasProfileCompleted(user: PrismaUser) {
    const hasSocialLinks = Boolean(
      user.urlWebsite ||
        user.urlX ||
        user.urlFacebook ||
        user.urlInstagram ||
        user.urlYoutube ||
        user.urlTiktok,
    );
    return Boolean(user.image && user.bio && hasSocialLinks);
  }

  static async updateProfile(
    ctx: IContext,
    { input }: GqlMutationUserUpdateMyProfileArgs,
    tx: Prisma.TransactionClient,
  ) {
    const data: Prisma.UserUpdateInput = UserConverter.update(input);
    return UserRepository.updateProfile(ctx, ctx.uid, data, tx);
  }
}
