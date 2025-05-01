import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { PrismaParticipationStatusHistory } from "@/application/domain/experience/participation/statusHistory/data/type";

export interface IParticipationStatusHistoryRepository {
  query(
    ctx: IContext,
    where: Prisma.ParticipationStatusHistoryWhereInput,
    orderBy: Prisma.ParticipationStatusHistoryOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ): Promise<PrismaParticipationStatusHistory[]>;

  find(ctx: IContext, id: string): Promise<PrismaParticipationStatusHistory | null>;

  create(
    ctx: IContext,
    data: Prisma.ParticipationStatusHistoryCreateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaParticipationStatusHistory>;

  createMany(
    ctx: IContext,
    data: Prisma.ParticipationStatusHistoryCreateManyInput[],
    tx?: Prisma.TransactionClient,
  ): Promise<Prisma.BatchPayload>;
}
