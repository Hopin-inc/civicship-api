import { PrismaClientIssuer } from "@/prisma/client";
import { Prisma, WalletType } from "@prisma/client";
import { IContext } from "@/types/server";
import { walletInclude } from "@/domains/membership/wallet/type";

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

  static async find(ctx: IContext, id: string) {
    return this.issuer.public(ctx, (tx) => {
      return tx.wallet.findUnique({
        where: { id },
        include: walletInclude,
      });
    });
  }

  static async findByCommunityId(ctx: IContext, communityId: string) {
    return this.issuer.public(ctx, (tx) => {
      return tx.wallet.findFirst({
        where: { communityId, type: WalletType.COMMUNITY },
        include: walletInclude,
      });
    });
  }

  static async create(ctx: IContext, data: Prisma.WalletCreateInput) {
    return this.issuer.public(ctx, (tx) => {
      return tx.wallet.create({
        data,
        include: walletInclude,
      });
    });
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
