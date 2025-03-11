import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { Prisma, UtilityStatus } from "@prisma/client";
import { IContext } from "@/types/server";
import { utilityHistoryInclude } from "@/application/utilityHistory/data/type";

export default class UtilityHistoryRepository {
  private static issuer = new PrismaClientIssuer();

  static async query(
    ctx: IContext,
    where: Prisma.UtilityHistoryWhereInput,
    orderBy: Prisma.UtilityHistoryOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ) {
    return this.issuer.public(ctx, (tx) => {
      return tx.utilityHistory.findMany({
        where,
        orderBy,
        include: utilityHistoryInclude,
        take: take + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
      });
    });
  }

  static async find(ctx: IContext, id: string) {
    return this.issuer.public(ctx, (tx) => {
      return tx.utilityHistory.findUnique({
        where: { id },
        include: utilityHistoryInclude,
      });
    });
  }

  static async queryAvailableUtilities(ctx: IContext, walletId: string, utilityId: string) {
    return this.issuer.public(ctx, (tx) => {
      return tx.utilityHistory.findMany({
        where: {
          walletId,
          utilityId,
          status: { in: [UtilityStatus.PURCHASED, UtilityStatus.REFUNDED] },
        },
        include: utilityHistoryInclude,
      });
    });
  }

  static async create(
    ctx: IContext,
    data: Prisma.UtilityHistoryCreateInput,
    tx: Prisma.TransactionClient,
  ) {
    if (tx) {
      return tx.utilityHistory.create({
        data,
        include: utilityHistoryInclude,
      });
    } else {
      return this.issuer.public(ctx, (dbTx) => {
        return dbTx.utilityHistory.create({
          data,
          include: utilityHistoryInclude,
        });
      });
    }
  }

  static async delete(ctx: IContext, id: string) {
    return this.issuer.public(ctx, (tx) => {
      return tx.utilityHistory.delete({
        where: { id },
      });
    });
  }
}
