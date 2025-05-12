import { Prisma } from "@prisma/client";

export const participationStatusHistorySelectDetail =
  Prisma.validator<Prisma.ParticipationStatusHistorySelect>()({
    id: true,
    status: true,
    reason: true,

    participationId: true,
    createdBy: true,

    createdAt: true,
  });

export type PrismaParticipationStatusHistoryDetail = Prisma.ParticipationStatusHistoryGetPayload<{
  select: typeof participationStatusHistorySelectDetail;
}>;
