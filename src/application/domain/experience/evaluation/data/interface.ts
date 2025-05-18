import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import {
  PrismaEvaluation,
  PrismaEvaluationDetail,
} from "@/application/domain/experience/evaluation/data/type";

export interface IEvaluationRepository {
  query(
    ctx: IContext,
    where: Prisma.EvaluationWhereInput,
    orderBy: Prisma.EvaluationOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ): Promise<PrismaEvaluationDetail[]>;

  find(ctx: IContext, id: string): Promise<PrismaEvaluationDetail | null>;

  create(
    ctx: IContext,
    data: Prisma.EvaluationCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaEvaluation>;
}
