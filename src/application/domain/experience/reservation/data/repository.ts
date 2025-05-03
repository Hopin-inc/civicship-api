import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { reservationInclude, reservationSelectDetail, PrismaReservationDetail } from "@/application/domain/experience/reservation/data/type";
import { IReservationRepository } from "@/application/domain/experience/reservation/data/interface";
import { injectable } from "tsyringe";

@injectable()
export default class ReservationRepository implements IReservationRepository {
  async query(
    ctx: IContext,
    where: Prisma.ReservationWhereInput,
    orderBy: Prisma.ReservationOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ): Promise<PrismaReservationDetail[]> {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.reservation.findMany({
        where,
        orderBy,
        take: take + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        select: reservationSelectDetail,
      });
    });
  }

  async count(ctx: IContext, where: Prisma.ReservationWhereInput, tx: Prisma.TransactionClient) {
    return tx.reservation.count({
      where,
    });
  }

  async find(ctx: IContext, id: string): Promise<PrismaReservationDetail | null> {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.reservation.findUnique({
        where: { id },
        select: reservationSelectDetail,
      });
    });
  }

  async checkConflict(ctx: IContext, where: Prisma.ReservationWhereInput): Promise<PrismaReservationDetail[]> {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.reservation.findMany({
        where,
        select: reservationSelectDetail,
      });
    });
  }

  async create(ctx: IContext, data: Prisma.ReservationCreateInput, tx: Prisma.TransactionClient): Promise<PrismaReservationDetail> {
    return tx.reservation.create({
      data,
      select: reservationSelectDetail,
    });
  }

  async setStatus(
    ctx: IContext,
    id: string,
    data: Prisma.ReservationUpdateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaReservationDetail> {
    return tx.reservation.update({
      where: { id },
      data,
      select: reservationSelectDetail,
    });
  }
}
