import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import {
  evaluationHistoryInclude,
  PrismaEvaluationHistory,
} from "@/application/domain/experience/evaluation/evaluationHistory/data/type";
import { GqlEvaluationHistory } from "@/types/graphql";
import EvaluationHistoryPresenter from "@/application/domain/experience/evaluation/evaluationHistory/presenter";
import { createHasManyLoaderByKey } from "@/presentation/graphql/dataloader/utils";
import DataLoader from "dataloader";

async function batchEvaluationHistoriesById(
  issuer: PrismaClientIssuer,
  ids: readonly string[],
): Promise<(GqlEvaluationHistory | null)[]> {
  const records = await issuer.internal((tx) =>
    tx.evaluationHistory.findMany({
      where: { id: { in: [...ids] } },
      include: evaluationHistoryInclude,
    }),
  );

  const map = new Map(records.map((r) => [r.id, EvaluationHistoryPresenter.get(r)]));
  return ids.map((id) => map.get(id) ?? null);
}

export function createEvaluationHistoryLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlEvaluationHistory | null>((keys) =>
    batchEvaluationHistoriesById(issuer, keys),
  );
}

export function createEvaluationHistoriesByEvaluationLoader(issuer: PrismaClientIssuer) {
  return createHasManyLoaderByKey<"evaluationId", PrismaEvaluationHistory, GqlEvaluationHistory>(
    "evaluationId",
    async (evaluationIds) => {
      return issuer.internal((tx) =>
        tx.evaluationHistory.findMany({
          where: {
            evaluationId: { in: [...evaluationIds] },
          },
          include: evaluationHistoryInclude,
        }),
      );
    },
    EvaluationHistoryPresenter.get,
  );
}

export function createEvaluationHistoriesCreatedByUserLoader(issuer: PrismaClientIssuer) {
  return createHasManyLoaderByKey<"createdBy", PrismaEvaluationHistory, GqlEvaluationHistory>(
    "createdBy",
    async (userIds) => {
      return issuer.internal((tx) =>
        tx.evaluationHistory.findMany({
          where: { createdBy: { in: [...userIds] } },
          include: evaluationHistoryInclude,
        }),
      );
    },
    EvaluationHistoryPresenter.get,
  );
}
