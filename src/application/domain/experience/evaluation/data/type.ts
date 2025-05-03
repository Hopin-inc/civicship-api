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
  evaluatorId: true,
  participationId: true,
  score: true,
  comment: true,
  createdAt: true,
  updatedAt: true,
  evaluator: { select: { id: true } },
  participation: { 
    select: { 
      id: true,
      userId: true,
      reservationId: true,
      user: { select: { id: true } },
      reservation: { 
        select: { 
          id: true,
          opportunitySlotId: true,
          opportunitySlot: { 
            select: { 
              id: true,
              opportunityId: true,
              opportunity: { select: { id: true, name: true } }
            } 
          }
        } 
      }
    } 
  },
});

export type PrismaEvaluation = Prisma.EvaluationGetPayload<{
  include: typeof evaluationInclude;
}>;

export type PrismaEvaluationDetail = Prisma.EvaluationGetPayload<{
  select: typeof evaluationSelectDetail;
}>;
