import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { GqlQueryWalletsArgs } from "@/types/graphql";
import { NotFoundError } from "@/errors/graphql";
import WalletConverter from "@/application/domain/account/wallet/data/converter";
import { IWalletRepository } from "@/application/domain/account/wallet/data/interface";
import { inject, injectable } from "tsyringe";
import { PrismaWallet } from "@/application/domain/account/wallet/data/type";

@injectable()
export default class WalletService {
  constructor(
    @inject("WalletRepository") private readonly repository: IWalletRepository,
    @inject("WalletConverter") private readonly converter: WalletConverter,
  ) { }

  async fetchWallets(ctx: IContext, { filter, sort, cursor }: GqlQueryWalletsArgs, take: number) {
    const where = this.converter.filter(filter ?? {});
    const orderBy = this.converter.sort(sort ?? {});

    return this.repository.query(ctx, where, orderBy, take, cursor);
  }

  async findWallet(ctx: IContext, id: string) {
    return this.repository.find(ctx, id);
  }

  async findMemberWallet(ctx: IContext, userId: string, communityId: string) {
    return this.repository.findFirstExistingMemberWallet(ctx, communityId, userId);
  }

  async findMemberWalletOrThrow(ctx: IContext, userId: string, communityId: string, retried: boolean = false) {
    const wallet = await this.repository.findFirstExistingMemberWallet(ctx, communityId, userId);
    if (!wallet) {
      throw new NotFoundError("Member wallet", { userId, communityId });
    }
    const refreshed = await this.refreshCurrentPointViewIfNotExist(ctx, wallet);
    return refreshed && !retried
      ? await this.findMemberWalletOrThrow(ctx, userId, communityId, true)
      : wallet;
  }

  async findCommunityWalletOrThrow(ctx: IContext, communityId: string) {
    const wallet = await this.repository.findCommunityWallet(ctx, communityId);
    if (!wallet?.id) {
      throw new NotFoundError("Community wallet", { communityId });
    }
    return wallet;
  }

  async checkIfMemberWalletExists(ctx: IContext, memberWalletId: string) {
    const wallet = await this.repository.find(ctx, memberWalletId);
    if (!wallet) {
      throw new NotFoundError("Member wallet", { memberWalletId });
    }
    return wallet;
  }

  async createCommunityWallet(ctx: IContext, communityId: string, tx: Prisma.TransactionClient) {
    const data: Prisma.WalletCreateInput = this.converter.createCommunityWallet({
      communityId,
    });
    return this.repository.create(ctx, data, tx);
  }

  async createMemberWalletIfNeeded(
    ctx: IContext,
    userId: string,
    communityId: string,
    tx: Prisma.TransactionClient,
  ) {
    const existingWallet = await this.repository.findFirstExistingMemberWallet(
      ctx,
      communityId,
      userId,
    );
    if (existingWallet) {
      return existingWallet;
    }

    const data: Prisma.WalletCreateInput = this.converter.createMemberWallet({
      userId,
      communityId,
    });
    return this.repository.create(ctx, data, tx);
  }

  async deleteMemberWallet(
    ctx: IContext,
    userId: string,
    communityId: string,
    tx: Prisma.TransactionClient,
  ) {
    const memberWallet = await this.findMemberWalletOrThrow(ctx, communityId, userId);
    return this.repository.delete(ctx, memberWallet.id, tx);
  }

  private async refreshCurrentPointViewIfNotExist(ctx: IContext, wallet: PrismaWallet) {
    if (wallet.currentPointView === null) {
      // ポイントビューが存在しない場合は、単純にfalseを返す
      // 実際のリフレッシュ処理は別の場所で行う
      return false;
    } else return false;
  }
}
