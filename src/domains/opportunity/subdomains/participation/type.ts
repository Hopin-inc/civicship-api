import { Prisma } from "@prisma/client";

export const participationInclude = Prisma.validator<Prisma.ParticipationInclude>()({
  user: true,
  opportunity: {
    include: {
      community: {
        include: {
          city: {
            include: {
              state: true,
            },
          },
        },
      },
      createdByUser: true,
      city: { include: { state: true } },
      participations: true,
    },
  },
  statusHistories: {
    include: {
      participation: true,
      createdByUser: true,
    },
  },
  transactions: true,
});

export type ParticipationPayloadWithArgs = Prisma.ParticipationGetPayload<{
  include: typeof participationInclude;
}>;
