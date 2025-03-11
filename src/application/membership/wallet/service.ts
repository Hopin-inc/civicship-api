import { Prisma } from "@prisma/client";
import WalletInputFormat from "@/presentation/graphql/dto/membership/wallet/input";
import WalletRepository from "@/infrastructure/prisma/repositories/membership/wallet";
import { IContext } from "@/types/server";
import { GqlQueryWalletsArgs, GqlWallet } from "@/types/graphql";
import WalletUtils from "@/application/membership/wallet/utils";

export default class WalletService {
  static async fetchWallets(
    ctx: IContext,
    { filter, sort, cursor }: GqlQueryWalletsArgs,
    take: number,
  ) {
    const where = WalletInputFormat.filter(filter ?? {});
    const orderBy = WalletInputFormat.sort(sort ?? {});

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
      throw new Error(`WalletNotFound: userId=${userId}, communityId=${communityId}`);
    }

    return wallet;
  }

  static async findCommunityWalletOrThrow(ctx: IContext, communityId: string): Promise<GqlWallet> {
    const wallet = await WalletRepository.findCommunityWallet(ctx, communityId);
    if (!wallet?.id) {
      throw new Error("Wallet information is missing for points transfer");
    }
    return wallet;
  }

  static async checkIfMemberWalletExists(ctx: IContext, memberWalletId: string) {
    const memberWallet = await WalletRepository.find(ctx, memberWalletId);
    if (!memberWallet) {
      throw new Error("MemberWallet information is missing for points transfer");
    }

    return memberWallet;
  }

  static async findWalletsForPurchaseUtility(
    ctx: IContext,
    memberWalletId: string,
    communityId: string,
    requiredPoints: number,
  ) {
    const memberWallet = await this.checkIfMemberWalletExists(ctx, memberWalletId);
    const communityWallet = await this.findCommunityWalletOrThrow(ctx, communityId);

    await WalletUtils.validateTransfer(requiredPoints, memberWallet, communityWallet);

    return { fromWalletId: memberWallet.id, toWalletId: communityWallet.id };
  }

  static async findWalletsForRefundUtility(
    ctx: IContext,
    memberWalletId: string,
    communityId: string,
    requiredPoints: number,
  ) {
    const memberWallet = await this.checkIfMemberWalletExists(ctx, memberWalletId);
    const communityWallet = await this.findCommunityWalletOrThrow(ctx, communityId);

    await WalletUtils.validateTransfer(requiredPoints, communityWallet, memberWallet);

    return { fromWalletId: communityWallet.id, toWalletId: memberWallet.id };
  }

  static async findWalletsForGiveReward(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    communityId: string,
    userId: string,
    transferPoints: number,
  ) {
    const communityWallet = await this.findCommunityWalletOrThrow(ctx, communityId);
    const memberWallet = await this.findMemberWalletOrThrow(ctx, communityId, userId, tx);

    await WalletUtils.validateTransfer(transferPoints, communityWallet, memberWallet);

    return { fromWalletId: communityWallet.id, toWalletId: memberWallet.id };
  }

  static async createCommunityWallet(
    ctx: IContext,
    communityId: string,
    tx: Prisma.TransactionClient,
  ) {
    const data: Prisma.WalletCreateInput = WalletInputFormat.createCommunityWallet({
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

    const data: Prisma.WalletCreateInput = WalletInputFormat.createMemberWallet({
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
