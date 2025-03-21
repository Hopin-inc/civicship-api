import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { Prisma } from "@prisma/client";
import { participationInclude } from "@/application/participation/data/type";
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

  static async queryByReservationId(ctx: IContext, id: string) {
    return this.issuer.public(ctx, (tx) => {
      return tx.participation.findMany({
        where: { reservationId: id },
        include: participationInclude,
      });
    });
  }

  static async count(
    ctx: IContext,
    where: Prisma.ParticipationWhereInput,
    tx?: Prisma.TransactionClient,
  ) {
    if (tx) {
      return tx.participation.count({
        where,
      });
    } else {
      return this.issuer.public(ctx, (dbTx) => {
        return dbTx.participation.count({
          where,
        });
      });
    }
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

  static async create(ctx: IContext, data: Prisma.ParticipationCreateInput) {
    return this.issuer.public(ctx, (tx) => {
      return tx.participation.create({
        data,
        include: participationInclude,
      });
    });
  }

  static async setStatus(
    ctx: IContext,
    id: string,
    data: Prisma.ParticipationUpdateInput,
    tx?: Prisma.TransactionClient,
  ) {
    if (tx) {
      return tx.participation.update({
        where: { id },
        data,
        include: participationInclude,
      });
    } else {
      return this.issuer.public(ctx, (dbTx) => {
        return dbTx.participation.update({
          where: { id },
          data,
          include: participationInclude,
        });
      });
    }
  }

  static async bulkSetParticipationStatus(
    ctx: IContext,
    ids: string[],
    data: Prisma.ParticipationUpdateInput,
    tx: Prisma.TransactionClient,
  ) {
    return tx.participation.updateMany({
      where: { id: { in: ids } },
      data,
    });
  }
}
