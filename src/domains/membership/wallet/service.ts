import { Prisma } from "@prisma/client";
import WalletInputFormat from "@/domains/membership/wallet/presenter/input";
import WalletRepository from "@/domains/membership/wallet/repository";
import { IContext } from "@/types/server";
import { GqlQueryWalletsArgs } from "@/types/graphql";
import WalletUtils from "@/domains/membership/wallet/utils";

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

  static async findWalletsForGiveReward(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    communityId: string,
    participationId: string,
    fromPointChange: number,
  ) {
    const communityWallet = await WalletRepository.findCommunityWallet(ctx, communityId, tx);
    if (!communityWallet) {
      throw new Error(`No community wallet found for communityId: ${communityId}`);
    }

    const participantWallet = await WalletRepository.checkIfExistingMemberWallet(
      ctx,
      communityId,
      participationId,
      tx,
    );
    if (!participantWallet) {
      throw new Error(`No participant wallet found for participationId: ${participationId}`);
    }

    await WalletUtils.validateTransfer(fromPointChange, communityWallet, participantWallet);

    return { from: communityWallet.id, to: participantWallet.id };
  }

  static async createCommunityWallet(
    ctx: IContext,
    communityId: string,
    tx: Prisma.TransactionClient,
  ) {
    const data: Prisma.WalletCreateInput = WalletInputFormat.createToCommunity({
      communityId,
    });
    return WalletRepository.create(ctx, data, tx);
  }

  static async createMemberWallet(
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
      return;
    }

    const data: Prisma.WalletCreateInput = WalletInputFormat.createToMember({
      userId,
      communityId,
    });
    return WalletRepository.create(ctx, data, tx);
  }
}
