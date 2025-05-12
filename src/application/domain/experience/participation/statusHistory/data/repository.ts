import { Prisma } from "@prisma/client";
import { injectable } from "tsyringe";
import { IContext } from "@/types/server";
import { 
  participationStatusHistorySelectDetail,
  PrismaParticipationStatusHistoryDetail
} from "@/application/domain/experience/participation/statusHistory/data/type";
import { IParticipationStatusHistoryRepository } from "@/application/domain/experience/participation/statusHistory/data/interface";

@injectable()
export default class ParticipationStatusHistoryRepository
  implements IParticipationStatusHistoryRepository
{
  async query(
    ctx: IContext,
    where: Prisma.ParticipationStatusHistoryWhereInput,
    orderBy: Prisma.ParticipationStatusHistoryOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ): Promise<PrismaParticipationStatusHistoryDetail[]> {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.participationStatusHistory.findMany({
        where,
        orderBy,
        select: participationStatusHistorySelectDetail,
        take: take + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
      });
    });
  }

  async find(ctx: IContext, id: string): Promise<PrismaParticipationStatusHistoryDetail | null> {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.participationStatusHistory.findUnique({
        where: { id },
        select: participationStatusHistorySelectDetail,
      });
    });
  }

  async create(
    ctx: IContext,
    data: Prisma.ParticipationStatusHistoryCreateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaParticipationStatusHistoryDetail> {
    return tx.participationStatusHistory.create({
      data,
      select: participationStatusHistorySelectDetail,
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
