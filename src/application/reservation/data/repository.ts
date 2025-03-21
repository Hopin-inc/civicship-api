import { Prisma } from "@prisma/client";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { IContext } from "@/types/server";
import { reservationInclude } from "@/application/reservation/data/type";

export default class ReservationRepository {
  private static issuer = new PrismaClientIssuer();

  static async query(
    ctx: IContext,
    where: Prisma.ReservationWhereInput,
    orderBy: Prisma.ReservationOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ) {
    return this.issuer.public(ctx, (tx) => {
      return tx.reservation.findMany({
        where,
        orderBy,
        take: take + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        include: reservationInclude,
      });
    });
  }

  static async find(ctx: IContext, id: string) {
    return this.issuer.public(ctx, (tx) => {
      return tx.reservation.findUnique({
        where: { id },
        include: reservationInclude,
      });
    });
  }

  static async checkConflict(ctx: IContext, where: Prisma.ReservationWhereInput) {
    return this.issuer.public(ctx, (tx) => {
      return tx.reservation.findMany({
        where,
        include: reservationInclude,
      });
    });
  }

  static async create(ctx: IContext, data: Prisma.ReservationCreateInput) {
    return this.issuer.public(ctx, (tx) => {
      return tx.reservation.create({
        data,
        include: reservationInclude,
      });
    });
  }

  static async setStatus(
    ctx: IContext,
    id: string,
    data: Prisma.ReservationUpdateInput,
    tx?: Prisma.TransactionClient,
  ) {
    if (tx) {
      return tx.reservation.update({
        where: { id },
        data,
        include: reservationInclude,
      });
    } else {
      return this.issuer.public(ctx, (dbTx) =>
        dbTx.reservation.update({
          where: { id },
          data,
          include: reservationInclude,
        }),
      );
    }
  }
}
