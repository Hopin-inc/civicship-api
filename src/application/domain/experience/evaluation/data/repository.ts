import { Prisma } from "@prisma/client";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { IContext } from "@/types/server";
import { evaluationInclude } from "@/application/domain/experience/evaluation/data/type";

export default class EvaluationRepository {
  private static issuer = new PrismaClientIssuer();

  static async query(
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

  static async find(ctx: IContext, id: string) {
    return this.issuer.public(ctx, (tx) => {
      return tx.evaluation.findUnique({
        where: { id },
        include: evaluationInclude,
      });
    });
  }

  static async create(
    ctx: IContext,
    data: Prisma.EvaluationCreateInput,
    tx?: Prisma.TransactionClient,
  ) {
    if (tx) {
      return tx.evaluation.create({
        data,
        include: evaluationInclude,
      });
    } else {
      return this.issuer.public(ctx, (dbTx) => {
        return dbTx.evaluation.create({
          data,
          include: evaluationInclude,
        });
      });
    }
  }
}
