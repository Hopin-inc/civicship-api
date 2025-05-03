import { IContext } from "@/types/server";
import { walletSelectDetail, PrismaWalletDetail } from "@/application/domain/account/wallet/data/type";
import { IWalletRepository } from "@/application/domain/account/wallet/data/interface";
import { injectable } from "tsyringe";
import { Prisma, WalletType } from "@prisma/client";

@injectable()
export default class WalletRepository implements IWalletRepository {
  async query(
    ctx: IContext,
    where: Prisma.WalletWhereInput,
    orderBy: Prisma.WalletOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ): Promise<PrismaWalletDetail[]> {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.wallet.findMany({
        where,
        orderBy,
        select: walletSelectDetail,
        take: take + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
      });
    });
  }

  async find(ctx: IContext, id: string): Promise<PrismaWalletDetail | null> {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.wallet.findUnique({
        where: { id },
        select: walletSelectDetail,
      });
    });
  }

  async findCommunityWallet(ctx: IContext, communityId: string): Promise<PrismaWalletDetail | null> {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.wallet.findFirst({
        where: { communityId, type: WalletType.COMMUNITY },
        select: walletSelectDetail,
      });
    });
  }

  async findFirstExistingMemberWallet(ctx: IContext, communityId: string, userId: string): Promise<PrismaWalletDetail | null> {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.wallet.findFirst({
        where: { communityId, userId, type: WalletType.MEMBER },
        select: walletSelectDetail,
      });
    });
  }

  async create(ctx: IContext, data: Prisma.WalletCreateInput, tx: Prisma.TransactionClient): Promise<PrismaWalletDetail> {
    return tx.wallet.create({
      data,
      select: walletSelectDetail,
    });
  }

  async delete(ctx: IContext, id: string, tx: Prisma.TransactionClient): Promise<PrismaWalletDetail> {
    return tx.wallet.delete({
      where: { id },
      select: walletSelectDetail,
    });
  }
}
