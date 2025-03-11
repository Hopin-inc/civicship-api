import { Prisma } from "@prisma/client";

export const participationStatusHistoryInclude =
  Prisma.validator<Prisma.ParticipationStatusHistoryInclude>()({
    createdByUser: true,
    participation: true,
  });

export type ParticipationStatusHistoryPayloadWithArgs =
  Prisma.ParticipationStatusHistoryGetPayload<{
    include: typeof participationStatusHistoryInclude;
  }>;
