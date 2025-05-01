import { Prisma } from "@prisma/client";
import { inject, injectable } from "tsyringe";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { IContext } from "@/types/server";
import { participationStatusHistoryInclude } from "@/application/domain/experience/participation/statusHistory/data/type";
import { IParticipationStatusHistoryRepository } from "@/application/domain/experience/participation/statusHistory/data/interface";

@injectable()
export default class ParticipationStatusHistoryRepository
  implements IParticipationStatusHistoryRepository
{
  constructor(@inject("PrismaClientIssuer") private readonly issuer: PrismaClientIssuer) {}

  async query(
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

  async find(ctx: IContext, id: string) {
    return this.issuer.public(ctx, (tx) => {
      return tx.participationStatusHistory.findUnique({
        where: { id },
        include: participationStatusHistoryInclude,
      });
    });
  }

  async create(
    ctx: IContext,
    data: Prisma.ParticipationStatusHistoryCreateInput,
    tx: Prisma.TransactionClient,
  ) {
    return tx.participationStatusHistory.create({
      data,
      include: participationStatusHistoryInclude,
    });
  }

  async createMany(
    ctx: IContext,
    data: Prisma.ParticipationStatusHistoryCreateManyInput[],
    tx: Prisma.TransactionClient,
  ) {
    return tx.participationStatusHistory.createMany({
      data,
    });
  }
}
