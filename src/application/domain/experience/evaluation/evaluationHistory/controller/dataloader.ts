import { PrismaClient } from "@prisma/client";
import {
  evaluationHistoryInclude,
  PrismaEvaluationHistory,
} from "@/application/domain/experience/evaluation/evaluationHistory/data/type";
import { GqlEvaluationHistory } from "@/types/graphql";
import EvaluationHistoryPresenter from "@/application/domain/experience/evaluation/evaluationHistory/presenter";
import { createHasManyLoaderByKey } from "@/presentation/graphql/dataloader/utils";
import DataLoader from "dataloader";

async function batchEvaluationHistoriesById(
  prisma: PrismaClient,
  ids: readonly string[],
): Promise<(GqlEvaluationHistory | null)[]> {
  const records = await prisma.evaluationHistory.findMany({
    where: { id: { in: [...ids] } },
    include: evaluationHistoryInclude,
  });

  const map = new Map(records.map((r) => [r.id, EvaluationHistoryPresenter.get(r)]));
  return ids.map((id) => map.get(id) ?? null);
}

export function createEvaluationHistoryLoader(prisma: PrismaClient) {
  return new DataLoader<string, GqlEvaluationHistory | null>((keys) =>
    batchEvaluationHistoriesById(prisma, keys)
  );
}

export function createEvaluationHistoriesByEvaluationLoader(prisma: PrismaClient) {
  return createHasManyLoaderByKey<"evaluationId", PrismaEvaluationHistory, GqlEvaluationHistory>(
    "evaluationId",
    async (evaluationIds) => {
      return prisma.evaluationHistory.findMany({
        where: {
          evaluationId: { in: [...evaluationIds] },
        },
        include: evaluationHistoryInclude,
      });
    },
    EvaluationHistoryPresenter.get,
  );
}

export function createEvaluationHistoriesCreatedByUserLoader(prisma: PrismaClient) {
  return createHasManyLoaderByKey<"createdBy", PrismaEvaluationHistory, GqlEvaluationHistory>(
    "createdBy",
    async (userIds) => {
      return prisma.evaluationHistory.findMany({
        where: { createdBy: { in: [...userIds] } },
        include: evaluationHistoryInclude,
      });
    },
    EvaluationHistoryPresenter.get,
  );
}
