import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
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

export function createEvaluationLoader(issuer: PrismaClientIssuer) {
  return createLoaderById<PrismaEvaluationDetail, GqlEvaluation>(
    async (ids) =>
      issuer.internal((tx) =>
        tx.evaluation.findMany({
          where: { id: { in: [...ids] } },
          select: evaluationSelectDetail,
        }),
      ),
    EvaluationPresenter.get,
  );
}

export function createEvaluationsByUserLoader(issuer: PrismaClientIssuer) {
  return createHasManyLoaderByKey<"evaluatorId", PrismaEvaluationDetail, GqlEvaluation>(
    "evaluatorId",
    async (userIds) => {
      return issuer.internal((tx) =>
        tx.evaluation.findMany({
          where: { evaluatorId: { in: [...userIds] } },
        }),
      );
    },
    EvaluationPresenter.get,
  );
}
