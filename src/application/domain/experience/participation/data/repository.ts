import { Prisma } from "@prisma/client";
import {
  participationSelectDetail,
  PrismaParticipationDetail,
} from "@/application/domain/experience/participation/data/type";
import { IContext } from "@/types/server";
import { injectable } from "tsyringe";
import { IParticipationRepository } from "./interface";

@injectable()
export default class ParticipationRepository implements IParticipationRepository {
  async query(
    ctx: IContext,
    where: Prisma.ParticipationWhereInput,
    orderBy: Prisma.ParticipationOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ): Promise<PrismaParticipationDetail[]> {
    return ctx.issuer.public(ctx, (tx) =>
      tx.participation.findMany({
        where,
        orderBy,
        take: take + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        select: participationSelectDetail,
      }),
    );
  }

  async queryByReservationId(ctx: IContext, id: string): Promise<PrismaParticipationDetail[]> {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.participation.findMany({
        where: { reservationId: id },
        select: participationSelectDetail,
      });
    });
  }

  async count(ctx: IContext, where: Prisma.ParticipationWhereInput) {
    return ctx.issuer.public(ctx, (dbTx) => {
      return dbTx.participation.count({
        where,
      });
    });
  }

  async find(ctx: IContext, id: string): Promise<PrismaParticipationDetail | null> {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.participation.findUnique({
        where: { id },
        select: participationSelectDetail,
      });
    });
  }

  async create(
    ctx: IContext,
    data: Prisma.ParticipationCreateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaParticipationDetail> {
    return tx.participation.create({
      data,
      select: participationSelectDetail,
    });
  }

  async update(
    ctx: IContext,
    id: string,
    data: Prisma.ParticipationUpdateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaParticipationDetail> {
    return tx.participation.update({
      where: { id },
      data,
      select: participationSelectDetail,
    });
  }

  async delete(
    ctx: IContext,
    id: string,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaParticipationDetail> {
    return tx.participation.delete({
      where: { id },
      select: participationSelectDetail,
    });
  }

  async bulkSetStatusByReservation(
    ctx: IContext,
    participationIds: string[],
    status: PrismaParticipationDetail["status"],
    reason: PrismaParticipationDetail["reason"],
    tx: Prisma.TransactionClient,
  ): Promise<Prisma.BatchPayload> {
    return tx.participation.updateMany({
      where: { id: { in: participationIds } },
      data: { status, reason },
    });
  }
}
