import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { Prisma, ParticipationStatus } from "@prisma/client";
import { participationInclude } from "@/application/participation/infrastructure/type";
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

  static async find(ctx: IContext, id: string, tx?: Prisma.TransactionClient) {
    if (tx) {
      return tx.participation.findUnique({
        where: { id },
        include: participationInclude,
      });
    } else {
      return this.issuer.public(ctx, (dbTx) => {
        return dbTx.participation.findUnique({
          where: { id },
          include: participationInclude,
        });
      });
    }
  }

  static async create(
    ctx: IContext,
    data: Prisma.ParticipationCreateInput,
    tx: Prisma.TransactionClient,
  ) {
    return tx.participation.create({
      data,
      include: participationInclude,
    });
  }

  static async setStatus(
    ctx: IContext,
    id: string,
    status: ParticipationStatus,
    tx?: Prisma.TransactionClient,
  ) {
    if (tx) {
      return tx.participation.update({
        where: { id },
        data: { status },
        include: participationInclude,
      });
    } else {
      return this.issuer.public(ctx, (dbTx) => {
        return dbTx.participation.update({
          where: { id },
          data: { status },
          include: participationInclude,
        });
      });
    }
  }
}
