import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { GqlEvaluation } from "@/types/graphql";
import EvaluationPresenter from "@/application/domain/experience/evaluation/presenter";
import {
  evaluationSelectDetail,
  PrismaEvaluationDetail,
} from "@/application/domain/experience/evaluation/data/type";
import { createHasManyLoaderByKey } from "@/presentation/graphql/dataloader/utils";

async function batchEvaluationsById(
  issuer: PrismaClientIssuer,
  ids: readonly string[],
): Promise<(GqlEvaluation | null)[]> {
  const records = await issuer.internal(async (tx) => {
    return tx.evaluation.findMany({
      where: { id: { in: [...ids] } },
      select: evaluationSelectDetail,
    });
  });

  const map = new Map(records.map((r) => [r.id, EvaluationPresenter.get(r)]));
  return ids.map((id) => map.get(id) ?? null);
}

export function createEvaluationLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlEvaluation | null>((keys) => batchEvaluationsById(issuer, keys));
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
