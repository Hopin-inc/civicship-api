import { GqlMutationUserUpdateMyProfileArgs, GqlQueryUsersArgs } from "@/types/graphql";
import UserRepository from "@/application/domain/user/data/repository";
import { IContext } from "@/types/server";
import UserConverter from "@/application/domain/user/data/converter";
import { Prisma } from "@prisma/client";
import { PrismaUser } from "@/application/domain/user/data/type";
import ImageService from "@/application/domain/image/service";

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
    return Boolean(user.imageId && user.bio && hasSocialLinks);
  }

  static async updateProfile(
    ctx: IContext,
    { input }: GqlMutationUserUpdateMyProfileArgs,
    tx: Prisma.TransactionClient,
  ) {
    const { data, image } = UserConverter.update(input);
    let uploadedImageData: Prisma.ImageCreateWithoutUsersInput | undefined = undefined;
    if (image) {
      uploadedImageData = await ImageService.uploadPublicImage(image, "users");
    }
    const userUpdateInput = {
      ...data,
      image: {
        create: uploadedImageData,
      },
    } satisfies Prisma.UserUpdateInput;
    return UserRepository.updateProfile(ctx, ctx.uid, userUpdateInput, tx);
  }
}
