import { PrismaClient } from "@prisma/client";
import { GqlEvaluation } from "@/types/graphql";
import EvaluationPresenter from "@/application/domain/experience/evaluation/presenter";
import {
  evaluationSelectDetail,
  PrismaEvaluationDetail,
} from "@/application/domain/experience/evaluation/data/type";
import {
  createHasManyLoaderByKey,
  createLoaderById,
} from "@/presentation/graphql/dataloader/utils";

export function createEvaluationLoader(prisma: PrismaClient) {
  return createLoaderById<PrismaEvaluationDetail, GqlEvaluation>(
    async (ids) =>
      prisma.evaluation.findMany({
        where: { id: { in: [...ids] } },
        select: evaluationSelectDetail,
      }),
    EvaluationPresenter.get,
  );
}

export function createEvaluationsByUserLoader(prisma: PrismaClient) {
  return createHasManyLoaderByKey<"evaluatorId", PrismaEvaluationDetail, GqlEvaluation>(
    "evaluatorId",
    async (userIds) => {
      return prisma.evaluation.findMany({
        where: { evaluatorId: { in: [...userIds] } },
      });
    },
    EvaluationPresenter.get,
  );
}
