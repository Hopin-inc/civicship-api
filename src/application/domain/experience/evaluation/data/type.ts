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

export const evaluationSelectDetail = Prisma.validator<Prisma.EvaluationSelect>()({
  id: true,
  status: true,
  evaluatorId: true,
  participationId: true,
  comment: true,
  createdAt: true,
  updatedAt: true,
});

export type PrismaEvaluation = Prisma.EvaluationGetPayload<{
  include: typeof evaluationInclude;
}>;

export type PrismaEvaluationDetail = Prisma.EvaluationGetPayload<{
  select: typeof evaluationSelectDetail;
}>;
