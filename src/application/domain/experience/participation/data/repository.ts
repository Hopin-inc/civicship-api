import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { Prisma } from "@prisma/client";
import {
  participationInclude,
  PrismaParticipation,
} from "@/application/domain/experience/participation/data/type";
import { IContext } from "@/types/server";
import { inject, injectable } from "tsyringe";
import { IParticipationRepository } from "./interface";

@injectable()
export default class ParticipationRepository implements IParticipationRepository {
  constructor(@inject("PrismaClientIssuer") private readonly issuer: PrismaClientIssuer) {}

  async query<T extends Prisma.ParticipationInclude>(
    ctx: IContext,
    where: Prisma.ParticipationWhereInput,
    orderBy: Prisma.ParticipationOrderByWithRelationInput[],
    take: number,
    cursor?: string,
    include?: T,
  ): Promise<Prisma.ParticipationGetPayload<{ include: T }>[]> {
    const finalInclude = (include ?? participationInclude) as unknown as T;

    return this.issuer.public(ctx, (tx) =>
      tx.participation.findMany({
        where,
        orderBy,
        take: take + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        include: finalInclude,
      }),
    );
  }

  async queryByReservationId(ctx: IContext, id: string) {
    return this.issuer.public(ctx, (tx) => {
      return tx.participation.findMany({
        where: { reservationId: id },
        include: participationInclude,
      });
    });
  }

  async count(ctx: IContext, where: Prisma.ParticipationWhereInput) {
    return this.issuer.public(ctx, (dbTx) => {
      return dbTx.participation.count({
        where,
      });
    });
  }

  async find(ctx: IContext, id: string): Promise<PrismaParticipation | null> {
    return this.issuer.public(ctx, (tx) => {
      return tx.participation.findUnique({
        where: { id },
        include: participationInclude,
      });
    });
  }

  async create(
    ctx: IContext,
    data: Prisma.ParticipationCreateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaParticipation> {
    return tx.participation.create({
      data,
      include: participationInclude,
    });
  }

  async update(
    ctx: IContext,
    id: string,
    data: Prisma.ParticipationUpdateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaParticipation> {
    return tx.participation.update({
      where: { id },
      data,
      include: participationInclude,
    });
  }

  async delete(
    ctx: IContext,
    id: string,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaParticipation> {
    return tx.participation.delete({
      where: { id },
      include: participationInclude,
    });
  }

  async bulkSetStatusByReservation(
    ctx: IContext,
    participationIds: string[],
    status: PrismaParticipation["status"],
    reason: PrismaParticipation["reason"],
    tx: Prisma.TransactionClient,
  ): Promise<Prisma.BatchPayload> {
    return tx.participation.updateMany({
      where: { id: { in: participationIds } },
      data: { status, reason },
    });
  }
}
