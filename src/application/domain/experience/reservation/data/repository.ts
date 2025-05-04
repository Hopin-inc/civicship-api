import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import {
  reservationInclude,
  reservationSelectDetail,
} from "@/application/domain/experience/reservation/data/type";
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
  ) {
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

  async find(ctx: IContext, id: string) {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.reservation.findUnique({
        where: { id },
        include: reservationInclude,
      });
    });
  }

  async checkConflict(ctx: IContext, where: Prisma.ReservationWhereInput) {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.reservation.findMany({
        where,
        include: reservationInclude,
      });
    });
  }

  async create(ctx: IContext, data: Prisma.ReservationCreateInput, tx: Prisma.TransactionClient) {
    return tx.reservation.create({
      data,
      include: reservationInclude,
    });
  }

  async setStatus(
    ctx: IContext,
    id: string,
    data: Prisma.ReservationUpdateInput,
    tx: Prisma.TransactionClient,
  ) {
    return tx.reservation.update({
      where: { id },
      data,
      include: reservationInclude,
    });
  }
}
