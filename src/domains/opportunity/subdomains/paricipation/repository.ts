import { PrismaClientIssuer } from "@/prisma/client";
import { Prisma, ParticipationStatus } from "@prisma/client";
import { participationInclude } from "@/domains/opportunity/subdomains/paricipation/type";
import { IContext } from "@/types/server";

export default class ParticipationRepository {
  private static issuer = new PrismaClientIssuer();

  static async query(
    ctx: IContext,
    where: Prisma.ParticipationWhereInput,
    orderBy: Prisma.ParticipationOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ) {
    return this.issuer.public(ctx, (tx) => {
      return tx.participation.findMany({
        where,
        orderBy,
        include: participationInclude,
        take: take + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
      });
    });
  }

  static async find(ctx: IContext, id: string) {
    return this.issuer.public(ctx, (tx) => {
      return tx.participation.findUnique({
        where: { id },
        include: participationInclude,
      });
    });
  }

  static async createWithTransaction(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    data: Prisma.ParticipationCreateInput,
  ) {
    return this.issuer.publicWithTransaction(ctx, tx, (transaction) => {
      return transaction.participation.create({
        data,
        include: participationInclude,
      });
    });
  }

  static async setStatusWithTransaction(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    id: string,
    status: ParticipationStatus,
  ) {
    return this.issuer.publicWithTransaction(ctx, tx, (transaction) => {
      return transaction.participation.update({
        where: { id },
        data: { status },
        include: participationInclude,
      });
    });
  }
}
