import { Prisma } from "@prisma/client";
import { inject, injectable } from "tsyringe";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { IContext } from "@/types/server";
import { evaluationInclude } from "@/application/domain/experience/evaluation/data/type";
import { IEvaluationRepository } from "@/application/domain/experience/evaluation/data/interface";

@injectable()
export default class EvaluationRepository implements IEvaluationRepository {
  constructor(
    @inject("PrismaClientIssuer")
    private readonly issuer: PrismaClientIssuer,
  ) {}

  async query(
    ctx: IContext,
    where: Prisma.EvaluationWhereInput,
    orderBy: Prisma.EvaluationOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ) {
    return this.issuer.public(ctx, (tx) => {
      return tx.evaluation.findMany({
        where,
        orderBy,
        take: take + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        include: evaluationInclude,
      });
    });
  }

  async find(ctx: IContext, id: string) {
    return this.issuer.public(ctx, (tx) => {
      return tx.evaluation.findUnique({
        where: { id },
        include: evaluationInclude,
      });
    });
  }

  async create(ctx: IContext, data: Prisma.EvaluationCreateInput, tx: Prisma.TransactionClient) {
    return tx.evaluation.create({
      data,
      include: evaluationInclude,
    });
  }
}
