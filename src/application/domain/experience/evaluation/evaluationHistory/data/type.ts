import { Prisma } from "@prisma/client";

export const evaluationHistoryInclude = Prisma.validator<Prisma.EvaluationHistoryInclude>()({
  createdByUser: true,
  evaluation: true,
});

export type PrismaEvaluationHistory = Prisma.EvaluationHistoryGetPayload<{
  include: typeof evaluationHistoryInclude;
}>;
