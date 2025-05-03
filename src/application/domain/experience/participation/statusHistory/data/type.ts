import { Prisma } from "@prisma/client";

export const participationStatusHistoryInclude =
  Prisma.validator<Prisma.ParticipationStatusHistoryInclude>()({
    createdByUser: true,
    participation: true,
  });

export const participationStatusHistorySelectDetail =
  Prisma.validator<Prisma.ParticipationStatusHistorySelect>()({
    id: true,
    status: true,
    reason: true,
    participationId: true,
    createdByUser: true,
    createdAt: true,
  });

export type PrismaParticipationStatusHistory = Prisma.ParticipationStatusHistoryGetPayload<{
  include: typeof participationStatusHistoryInclude;
}>;

export type PrismaParticipationStatusHistoryDetail = Prisma.ParticipationStatusHistoryGetPayload<{
  select: typeof participationStatusHistorySelectDetail;
}>;
