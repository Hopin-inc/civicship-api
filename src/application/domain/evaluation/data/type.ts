import { Prisma } from "@prisma/client";

export const evaluationInclude = Prisma.validator<Prisma.EvaluationInclude>()({
  evaluator: true,
  participation: {
    include: {
      opportunitySlot: {
        include: {
          opportunity: true,
        },
      },
    },
  },
});

export type PrismaEvaluation = Prisma.EvaluationGetPayload<{
  include: typeof evaluationInclude;
}>;
