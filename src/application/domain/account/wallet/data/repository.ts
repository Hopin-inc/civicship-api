import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { Prisma, WalletType } from "@prisma/client";
import { IContext } from "@/types/server";
import { walletInclude } from "@/application/domain/account/wallet/data/type";
import { IWalletRepository } from "@/application/domain/account/wallet/data/interface";

export default class WalletRepository implements IWalletRepository {
  constructor(private readonly issuer: PrismaClientIssuer) {}

  async query(
    ctx: IContext,
    where: Prisma.WalletWhereInput,
    orderBy: Prisma.WalletOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ) {
    return this.issuer.public(ctx, (tx) => {
      return tx.wallet.findMany({
        where,
        orderBy,
        include: walletInclude,
        take: take + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
      });
    });
  }

  async find(ctx: IContext, id: string) {
    return this.issuer.public(ctx, (tx) => {
      return tx.wallet.findUnique({
        where: { id },
        include: walletInclude,
      });
    });
  }

  async findCommunityWallet(ctx: IContext, communityId: string) {
    return this.issuer.public(ctx, (tx) => {
      return tx.wallet.findFirst({
        where: { communityId, type: WalletType.COMMUNITY },
        include: walletInclude,
      });
    });
  }

  async findFirstExistingMemberWallet(ctx: IContext, communityId: string, userId: string) {
    return this.issuer.public(ctx, (tx) => {
      return tx.wallet.findFirst({
        where: { communityId, userId, type: WalletType.MEMBER },
        include: walletInclude,
      });
    });
  }

  async create(ctx: IContext, data: Prisma.WalletCreateInput, tx: Prisma.TransactionClient) {
    return tx.wallet.create({
      data,
      include: walletInclude,
    });
  }

  async delete(ctx: IContext, id: string, tx: Prisma.TransactionClient) {
    return tx.wallet.delete({
      where: { id },
      include: walletInclude,
    });
  }
}
