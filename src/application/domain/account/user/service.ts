import { GqlMutationUserUpdateMyProfileArgs, GqlQueryUsersArgs } from "@/types/graphql";
import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";
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
      userUpdateInput.image = {
        create: await this.imageService.uploadPublicImage(image, "users"),
      };
    }

    return this.repository.update(ctx, ctx.currentUser.id, userUpdateInput, tx);
  }

  async updateWalletAddress(
    ctx: IContext,
    userId: string,
    walletAddress: string,
    tx: Prisma.TransactionClient,
  ) {
    const userUpdateInput: Prisma.UserUpdateInput = {
      walletAddress,
    };

    return this.repository.update(ctx, userId, userUpdateInput, tx);
  }
}
