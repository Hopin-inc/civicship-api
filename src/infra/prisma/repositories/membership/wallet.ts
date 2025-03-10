import { PrismaClientIssuer } from "@/infra/prisma/client";
import { Prisma, WalletType } from "@prisma/client";
import { IContext } from "@/types/server";
import { walletInclude } from "@/infra/prisma/types/membership/wallet";

export default class WalletRepository {
  private static issuer = new PrismaClientIssuer();

  static async query(
    ctx: IContext,
    where: Prisma.WalletWhereInput,
    orderBy: Prisma.WalletOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ) {
    return this.issuer.public(ctx, (tx) =>
      tx.wallet.findMany({
        where,
        orderBy,
        include: walletInclude,
        take: take + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
      }),
    );
  }

  static async find(ctx: IContext, id: string, tx?: Prisma.TransactionClient) {
    if (tx) {
      return tx.wallet.findUnique({
        where: { id },
        include: walletInclude,
      });
    } else {
      return this.issuer.public(ctx, (dbTx) => {
        return dbTx.wallet.findUnique({
          where: { id },
          include: walletInclude,
        });
      });
    }
  }

  static async findCommunityWallet(
    ctx: IContext,
    communityId: string,
    tx?: Prisma.TransactionClient,
  ) {
    if (tx) {
      return tx.wallet.findFirst({
        where: { communityId, type: WalletType.COMMUNITY },
        include: walletInclude,
      });
    } else {
      return this.issuer.public(ctx, (dbTx) => {
        return dbTx.wallet.findFirst({
          where: { communityId, type: WalletType.COMMUNITY },
          include: walletInclude,
        });
      });
    }
  }

  static async findFirstExistingMemberWallet(
    ctx: IContext,
    communityId: string,
    userId: string,
    tx?: Prisma.TransactionClient,
  ) {
    if (tx) {
      return tx.wallet.findFirst({
        where: { communityId, userId, type: WalletType.MEMBER },
        include: walletInclude,
      });
    } else {
      return this.issuer.public(ctx, (dbTx) => {
        return dbTx.wallet.findFirst({
          where: { communityId, userId, type: WalletType.MEMBER },
          include: walletInclude,
        });
      });
    }
  }

  static async create(
    ctx: IContext,
    data: Prisma.WalletCreateInput,
    tx?: Prisma.TransactionClient,
  ) {
    if (tx) {
      return tx.wallet.create({
        data,
        include: walletInclude,
      });
    } else {
      return this.issuer.public(ctx, (dbTx) => {
        return dbTx.wallet.create({
          data,
          include: walletInclude,
        });
      });
    }
  }

  static async delete(ctx: IContext, id: string) {
    return this.issuer.public(ctx, (tx) => {
      return tx.wallet.delete({
        where: { id },
        include: walletInclude,
      });
    });
  }
}
