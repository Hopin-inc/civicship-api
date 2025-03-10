import { Prisma } from "@prisma/client";
import WalletInputFormat from "@/presentation/graphql/dto/membership/wallet/input";
import WalletRepository from "@/infra/prisma/repositories/membership/wallet";
import { IContext } from "@/types/server";
import { GqlQueryWalletsArgs, GqlWallet } from "@/types/graphql";
import WalletUtils from "@/app/membership/wallet/utils";

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

  static async findCommunityWalletOrThrow(ctx: IContext, communityId: string): Promise<GqlWallet> {
    const wallet = await WalletRepository.findCommunityWallet(ctx, communityId);
    if (!wallet?.id) {
      throw new Error("Wallet information is missing for points transfer");
    }
    return wallet;
  }

  static async findWalletsForPurchaseUtility(
    ctx: IContext,
    memberWalletId: string,
    communityId: string,
    requiredPoints: number,
  ) {
    const memberWallet = await WalletRepository.find(ctx, memberWalletId);
    if (!memberWallet) {
      throw new Error("MemberWallet information is missing for points transfer");
    }

    const communityWallet = await WalletRepository.findCommunityWallet(ctx, communityId);
    if (!communityWallet) {
      throw new Error(`No community wallet found for communityId: ${communityId}`);
    }

    await WalletUtils.validateTransfer(requiredPoints, memberWallet, communityWallet);

    return { fromWalletId: memberWallet.id, toWalletId: communityWallet.id };
  }

  static async checkIfMemberWalletExists(ctx: IContext, memberWalletId: string) {
    const memberWallet = await WalletRepository.find(ctx, memberWalletId);
    if (!memberWallet) {
      throw new Error("MemberWallet information is missing for points transfer");
    }

    return memberWallet;
  }

  static async findWalletsForGiveReward(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    communityId: string,
    participantId: string,
    transferPoints: number,
  ) {
    const communityWallet = await WalletRepository.findCommunityWallet(ctx, communityId, tx);
    if (!communityWallet) {
      throw new Error(`No community wallet found for communityId: ${communityId}`);
    }

    const participantWallet = await WalletRepository.checkIfExistingMemberWallet(
      ctx,
      communityId,
      participantId,
      tx,
    );
    if (!participantWallet) {
      throw new Error(`No participant wallet found for participantId: ${participantId}`);
    }

    await WalletUtils.validateTransfer(transferPoints, communityWallet, participantWallet);

    return { fromWalletId: communityWallet.id, toWalletId: participantWallet.id };
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
    const existingWallet = await WalletRepository.checkIfExistingMemberWallet(
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
    const wallet = await WalletRepository.checkIfExistingMemberWallet(ctx, communityId, userId, tx);
    if (!wallet) {
      throw new Error(`WalletNotFound: userId=${userId}, communityId=${communityId}`);
    }

    return WalletRepository.delete(ctx, wallet.id);
  }
}
