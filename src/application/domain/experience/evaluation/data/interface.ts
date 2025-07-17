import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import {
  PrismaEvaluation,
  PrismaEvaluationDetail,
  PrismaEvaluationSelectSlotStartsAt,
} from "@/application/domain/experience/evaluation/data/type";

export interface IEvaluationRepository {
  query(
    ctx: IContext,
    where: Prisma.EvaluationWhereInput,
    orderBy: Prisma.EvaluationOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ): Promise<PrismaEvaluationDetail[]>;

  queryByParticipation(
    ctx: IContext,
    participationId: string,
  ): Promise<PrismaEvaluationSelectSlotStartsAt[]>;

  find(ctx: IContext, id: string): Promise<PrismaEvaluationDetail | null>;

  create(
    ctx: IContext,
    data: Prisma.EvaluationCreateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaEvaluation>;

  createMany(
    ctx: IContext,
    data: Prisma.EvaluationCreateManyInput[],
    tx: Prisma.TransactionClient,
  ): Promise<Prisma.BatchPayload>;

  findManyByIds(
    ctx: IContext,
    ids: string[],
    tx: Prisma.TransactionClient,
  ): Promise<PrismaEvaluation[]>;
}
