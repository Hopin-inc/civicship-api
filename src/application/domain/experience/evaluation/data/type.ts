import { Prisma } from "@prisma/client";

export const evaluationInclude = Prisma.validator<Prisma.EvaluationInclude>()({
  vcIssuanceRequest: true,
  evaluator: true,
  participation: {
    include: {
      opportunitySlot: {
        include: {
          opportunity: true,
        },
      },
      reservation: {
        include: {
          opportunitySlot: {
            include: {
              opportunity: true,
            },
          },
        },
      },
      user: { include: { identities: true, image: true } },
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

export const evaluationSelectSlotStartsAt = Prisma.validator<Prisma.EvaluationSelect>()({
  participation: {
    select: { reservation: { select: { opportunitySlot: { select: { startsAt: true } } } } },
  },
});

export type PrismaEvaluation = Prisma.EvaluationGetPayload<{
  include: typeof evaluationInclude;
}>;

export type PrismaEvaluationDetail = Prisma.EvaluationGetPayload<{
  select: typeof evaluationSelectDetail;
}>;

export type PrismaEvaluationSelectSlotStartsAt = Prisma.EvaluationGetPayload<{
  select: typeof evaluationSelectSlotStartsAt;
}>;
