import { GqlMutationUserUpdateMyProfileArgs, GqlQueryUsersArgs } from "@/types/graphql";
import { IContext } from "@/types/server";
import { IdentityPlatform, Prisma } from "@prisma/client";
import UserConverter from "@/application/domain/account/user/data/converter";
import ImageService from "@/application/domain/content/image/service";
import { IUserRepository } from "@/application/domain/account/user/data/interface";
import { inject, injectable } from "tsyringe";

@injectable()
export default class UserService {
  constructor(
    @inject("UserRepository") private readonly repository: IUserRepository,
    @inject("UserConverter") private readonly converter: UserConverter,
    @inject("ImageService") private readonly imageService: ImageService,
  ) {}

  async fetchUsers(ctx: IContext, { cursor, filter, sort }: GqlQueryUsersArgs, take: number) {
    const where = this.converter.filter(filter ?? {});
    const orderBy = this.converter.sort(sort ?? {});
    return this.repository.query(ctx, where, orderBy, take, cursor);
  }

  async fetchCommunityMembers(
    ctx: IContext,
    { cursor, filter, sort }: GqlQueryUsersArgs,
    take: number,
  ) {
    const where = this.converter.filter(filter ?? {});
    const orderBy = this.converter.sort(sort ?? {});
    return this.repository.query(ctx, where, orderBy, take, cursor);
  }

  async findUser(ctx: IContext, id: string) {
    return await this.repository.find(ctx, id);
  }

  async findUserByPhoneNumber(phoneNumber: string) {
    return await this.repository.findByPhoneNumber(phoneNumber);
  }

  async updateProfile(
    ctx: IContext,
    { input }: GqlMutationUserUpdateMyProfileArgs,
    tx: Prisma.TransactionClient,
  ) {
    if (!ctx.uid || !ctx.currentUser) {
      throw new Error("Authentication required (uid or platform missing)");
    }
    const { data, image } = this.converter.update(input);

    const userUpdateInput: Prisma.UserUpdateInput = {
      ...data,
    };
    if (image) {
      const uploadedImage = await this.imageService.uploadPublicImage(image, "users");
      if (uploadedImage) {
        userUpdateInput.image = {
          create: uploadedImage,
        };
      }
    }

    return this.repository.update(ctx, ctx.currentUser.id, userUpdateInput, tx);
  }

  async findLineUidForCommunity(
    ctx: IContext,
    userId: string,
    communityId: string,
  ): Promise<string | undefined> {
    const user = await ctx.issuer.internal(async (tx) => {
      return tx.user.findUnique({
        where: { id: userId },
        include: {
          identities: {
            where: {
              platform: IdentityPlatform.LINE,
              communityId: communityId,
            },
          },
        },
      });
    });

    return user?.identities[0]?.uid;
  }

  async findLineUidForGlobal(
    ctx: IContext,
    userId: string,
  ): Promise<string | undefined> {
    const user = await ctx.issuer.internal(async (tx) => {
      return tx.user.findUnique({
        where: { id: userId },
        include: {
          identities: {
            where: {
              platform: IdentityPlatform.LINE,
              communityId: null,
            },
          },
        },
      });
    });

    return user?.identities[0]?.uid;
  }

  async findLineUidAndLanguageForCommunity(
    ctx: IContext,
    userId: string,
    communityId: string,
  ): Promise<{ uid: string; language: import("@prisma/client").Language } | undefined> {
    const user = await ctx.issuer.internal(async (tx) => {
      return tx.user.findUnique({
        where: { id: userId },
        select: {
          preferredLanguage: true,
          identities: {
            where: {
              platform: IdentityPlatform.LINE,
              communityId: communityId,
            },
            select: {
              uid: true,
            },
          },
        },
      });
    });

    const uid = user?.identities[0]?.uid;
    if (!uid) return undefined;

    return {
      uid,
      language: user.preferredLanguage,
    };
  }

  async findLineUidAndLanguageForGlobal(
    ctx: IContext,
    userId: string,
  ): Promise<{ uid: string; language: import("@prisma/client").Language } | undefined> {
    const user = await ctx.issuer.internal(async (tx) => {
      return tx.user.findUnique({
        where: { id: userId },
        select: {
          preferredLanguage: true,
          identities: {
            where: {
              platform: IdentityPlatform.LINE,
              communityId: null,
            },
            select: {
              uid: true,
            },
          },
        },
      });
    });

    const uid = user?.identities[0]?.uid;
    if (!uid) return undefined;

    return {
      uid,
      language: user.preferredLanguage,
    };
  }

}
