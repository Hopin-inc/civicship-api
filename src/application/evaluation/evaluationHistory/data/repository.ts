import { Prisma } from "@prisma/client";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { IContext } from "@/types/server";
import { evaluationHistoryInclude } from "@/application/evaluation/evaluationHistory/data/type";

export default class EvaluationHistoryRepository {
  private static issuer = new PrismaClientIssuer();

  static async query(
    ctx: IContext,
    where: Prisma.EvaluationHistoryWhereInput,
    orderBy: Prisma.EvaluationHistoryOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ) {
    return this.issuer.public(ctx, (tx) =>
      tx.evaluationHistory.findMany({
        where,
        orderBy,
        take: take + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        include: evaluationHistoryInclude,
      }),
    );
  }

  static async find(ctx: IContext, id: string) {
    return this.issuer.public(ctx, (tx) =>
      tx.evaluationHistory.findUnique({
        where: { id },
        include: evaluationHistoryInclude,
      }),
    );
  }
}
