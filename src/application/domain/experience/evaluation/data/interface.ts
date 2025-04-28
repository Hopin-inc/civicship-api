import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { PrismaEvaluation } from "@/application/domain/experience/evaluation/data/type";

export interface IEvaluationRepository {
  query(
    ctx: IContext,
    where: Prisma.EvaluationWhereInput,
    orderBy: Prisma.EvaluationOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ): Promise<PrismaEvaluation[]>;

  find(ctx: IContext, id: string): Promise<PrismaEvaluation | null>;

  create(
    ctx: IContext,
    data: Prisma.EvaluationCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaEvaluation>;
}
