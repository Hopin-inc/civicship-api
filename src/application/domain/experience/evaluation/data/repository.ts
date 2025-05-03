import { Prisma } from "@prisma/client";
import { injectable } from "tsyringe";
import { IContext } from "@/types/server";
import { evaluationSelectDetail, PrismaEvaluationDetail } from "@/application/domain/experience/evaluation/data/type";
import { IEvaluationRepository } from "@/application/domain/experience/evaluation/data/interface";

@injectable()
export default class EvaluationRepository implements IEvaluationRepository {
  async query(
    ctx: IContext,
    where: Prisma.EvaluationWhereInput,
    orderBy: Prisma.EvaluationOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ): Promise<PrismaEvaluationDetail[]> {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.evaluation.findMany({
        where,
        orderBy,
        take: take + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        select: evaluationSelectDetail,
      });
    });
  }

  async find(ctx: IContext, id: string): Promise<PrismaEvaluationDetail | null> {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.evaluation.findUnique({
        where: { id },
        select: evaluationSelectDetail,
      });
    });
  }

  async create(ctx: IContext, data: Prisma.EvaluationCreateInput, tx: Prisma.TransactionClient): Promise<PrismaEvaluationDetail> {
    return tx.evaluation.create({
      data,
      select: evaluationSelectDetail,
    });
  }
}
