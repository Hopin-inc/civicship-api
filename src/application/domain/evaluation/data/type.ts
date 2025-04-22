import { Prisma } from "@prisma/client";

export const evaluationInclude = Prisma.validator<Prisma.EvaluationInclude>()({
  evaluator: true,
  participation: {
    include: {
      reservation: {
        include: {
          opportunitySlot: {
            include: {
              opportunity: true,
            },
          },
        },
      },
      user: true,
    },
  },
});

export type PrismaEvaluation = Prisma.EvaluationGetPayload<{
  include: typeof evaluationInclude;
}>;
