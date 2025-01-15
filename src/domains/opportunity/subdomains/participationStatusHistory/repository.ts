import { PrismaClientIssuer } from "@/prisma/client";
import { Prisma } from "@prisma/client";
import { participationStatusHistoryInclude } from "@/domains/opportunity/subdomains/participationStatusHistory/type";
import { IContext } from "@/types/server";

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
      });
    });
  }

  static async create(ctx: IContext, data: Prisma.ParticipationStatusHistoryCreateInput) {
    return this.issuer.public(ctx, (tx) => {
      return tx.participationStatusHistory.create({
        data,
      });
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
    return this.issuer.publicWithTransaction(ctx, tx, (transaction) => {
      return transaction.participationStatusHistory.create({
        data,
        include: participationStatusHistoryInclude,
      });
    });
  }
}
