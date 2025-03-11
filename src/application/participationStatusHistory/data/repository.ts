import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { participationStatusHistoryInclude } from "@/application/participationStatusHistory/data/type";

export default class ParticipationStatusHistoryRepository {
  private static issuer = new PrismaClientIssuer();

  static async query(
    ctx: IContext,
    where: Prisma.ParticipationStatusHistoryWhereInput,
    orderBy: Prisma.ParticipationStatusHistoryOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ) {
    return this.issuer.public(ctx, (tx) => {
      return tx.participationStatusHistory.findMany({
        where,
        orderBy,
        include: participationStatusHistoryInclude,
        take: take + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
      });
    });
  }

  static async find(ctx: IContext, id: string) {
    return this.issuer.public(ctx, (tx) => {
      return tx.participationStatusHistory.findUnique({
        where: { id },
        include: participationStatusHistoryInclude,
      });
    });
  }

  static async create(
    ctx: IContext,
    data: Prisma.ParticipationStatusHistoryCreateInput,
    tx: Prisma.TransactionClient,
  ) {
    return tx.participationStatusHistory.create({
      data,
      include: participationStatusHistoryInclude,
    });
  }

  static async delete(ctx: IContext, id: string) {
    return this.issuer.public(ctx, (tx) => {
      return tx.participationStatusHistory.delete({
        where: { id },
      });
    });
  }

  static async createWithTransaction(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    data: Prisma.ParticipationStatusHistoryCreateInput,
  ) {
    return tx.participationStatusHistory.create({
      data,
      include: participationStatusHistoryInclude,
    });
  }
}
