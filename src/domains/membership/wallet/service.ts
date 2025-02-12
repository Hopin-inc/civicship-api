import { Prisma } from "@prisma/client";
import WalletInputFormat from "@/domains/membership/wallet/presenter/input";
import WalletRepository from "@/domains/membership/wallet/repository";
import { IContext } from "@/types/server";
import { GqlQueryWalletsArgs } from "@/types/graphql";

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

  static async createCommunityWallet(ctx: IContext, communityId: string) {
    const data: Prisma.WalletCreateInput = WalletInputFormat.createToCommunity({
      communityId,
    });
    return WalletRepository.create(ctx, data);
  }

  static async createMemberWallet(
    ctx: IContext,
    userId: string,
    communityId: string,
    tx: Prisma.TransactionClient,
  ) {
    const existingWallet = await WalletRepository.checkIfExitMemberWallet(
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
