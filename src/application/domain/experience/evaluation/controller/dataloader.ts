import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { GqlEvaluation } from "@/types/graphql";
import EvaluationPresenter from "@/application/domain/experience/evaluation/presenter";
import { evaluationSelectDetail } from "@/application/domain/experience/evaluation/data/type";

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
  console.log(records);

  const map = new Map(records.map((r) => [r.id, EvaluationPresenter.get(r)]));
  return ids.map((id) => map.get(id) ?? null);
}

export function createEvaluationLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlEvaluation | null>((keys) => batchEvaluationsById(issuer, keys));
}
