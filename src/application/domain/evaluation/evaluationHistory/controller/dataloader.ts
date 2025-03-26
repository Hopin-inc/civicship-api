import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { evaluationHistoryInclude } from "@/application/domain/evaluation/evaluationHistory/data/type";
import { GqlEvaluationHistory } from "@/types/graphql";
import EvaluationHistoryPresenter from "@/application/domain/evaluation/evaluationHistory/presenter";

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
