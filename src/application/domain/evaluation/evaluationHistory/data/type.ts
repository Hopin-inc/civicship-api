import { Prisma } from "@prisma/client";
import { evaluationInclude } from "@/application/domain/evaluation/data/type";

export const evaluationHistoryInclude = Prisma.validator<Prisma.EvaluationHistoryInclude>()({
  createdByUser: true,
  evaluation: { include: evaluationInclude },
});

export type PrismaEvaluationHistory = Prisma.EvaluationHistoryGetPayload<{
  include: typeof evaluationHistoryInclude;
}>;
