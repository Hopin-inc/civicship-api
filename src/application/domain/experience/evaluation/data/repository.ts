import { Prisma } from "@prisma/client";
import { injectable } from "tsyringe";
import { IContext } from "@/types/server";
import {
  evaluationInclude,
  evaluationSelectDetail,
  evaluationSelectSlotStartsAt,
} from "@/application/domain/experience/evaluation/data/type";
import { IEvaluationRepository } from "@/application/domain/experience/evaluation/data/interface";

@injectable()
export default class EvaluationRepository implements IEvaluationRepository {
  async query(
    ctx: IContext,
    where: Prisma.EvaluationWhereInput,
    orderBy: Prisma.EvaluationOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ) {
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

  async queryByParticipation(ctx: IContext, participationId: string) {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.evaluation.findMany({
        where: { participationId },
        take: 1,
        select: evaluationSelectSlotStartsAt,
      });
    });
  }

  async find(ctx: IContext, id: string) {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.evaluation.findUnique({
        where: { id },
        select: evaluationSelectDetail,
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
