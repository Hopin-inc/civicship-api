import { Prisma } from "@prisma/client";
import WalletConverter from "@/application/membership/wallet/data/converter";
import WalletRepository from "@/application/membership/wallet/data/repository";
import { IContext } from "@/types/server";
import { GqlQueryWalletsArgs } from "@/types/graphql";
import { NotFoundError } from "@/errors/graphql";

export default class WalletService {
  static async fetchWallets(
    ctx: IContext,
    { filter, sort, cursor }: GqlQueryWalletsArgs,
    take: number,
  ) {
    const where = WalletConverter.filter(filter ?? {});
    const orderBy = WalletConverter.sort(sort ?? {});

    return WalletRepository.query(ctx, where, orderBy, take, cursor);
  }

  static async findWallet(ctx: IContext, id: string) {
    return WalletRepository.find(ctx, id);
  }

  static async findMemberWalletOrThrow(
    ctx: IContext,
    userId: string,
    communityId: string,
    tx?: Prisma.TransactionClient,
  ) {
    const wallet = await WalletRepository.findFirstExistingMemberWallet(
      ctx,
      communityId,
      userId,
      tx,
    );
    if (!wallet) {
      throw new NotFoundError("Member wallet" + `userId:${userId}, communityId:${communityId}`);
    }

    return wallet;
  }

  static async findCommunityWalletOrThrow(ctx: IContext, communityId: string) {
    const wallet = await WalletRepository.findCommunityWallet(ctx, communityId);
    if (!wallet?.id) {
      throw new NotFoundError("Community wallet", { communityId });
    }
    return wallet;
  }

  static async checkIfMemberWalletExists(ctx: IContext, memberWalletId: string) {
    const wallet = await WalletRepository.find(ctx, memberWalletId);
    if (!wallet) {
      throw new NotFoundError("Member wallet", { memberWalletId });
    }

    return wallet;
  }

  static async createCommunityWallet(
    ctx: IContext,
    communityId: string,
    tx: Prisma.TransactionClient,
  ) {
    const data: Prisma.WalletCreateInput = WalletConverter.createCommunityWallet({
      communityId,
    });
    return WalletRepository.create(ctx, data, tx);
  }

  static async createMemberWalletIfNeeded(
    ctx: IContext,
    userId: string,
    communityId: string,
    tx: Prisma.TransactionClient,
  ) {
    const existingWallet = await WalletRepository.findFirstExistingMemberWallet(
      ctx,
      communityId,
      userId,
      tx,
    );
    if (existingWallet) {
      return existingWallet;
    }

    const data: Prisma.WalletCreateInput = WalletConverter.createMemberWallet({
      userId,
      communityId,
    });
    return WalletRepository.create(ctx, data, tx);
  }

  static async deleteMemberWallet(
    ctx: IContext,
    userId: string,
    communityId: string,
    tx: Prisma.TransactionClient,
  ) {
    const memberWallet = await this.findMemberWalletOrThrow(ctx, communityId, userId, tx);
    return WalletRepository.delete(ctx, memberWallet.id);
  }
}
