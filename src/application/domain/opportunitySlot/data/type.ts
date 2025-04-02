import { Prisma } from "@prisma/client";

export const opportunitySlotInclude = Prisma.validator<Prisma.OpportunitySlotInclude>()({
  opportunity: {
    include: {
      requiredUtilities: {
        include: {
          community: true,
        },
      },
    },
  },
});

export const opportunitySlotWithParticipationInclude =
  Prisma.validator<Prisma.OpportunitySlotInclude>()({
    opportunity: {
      include: {
        requiredUtilities: {
          include: { community: true },
        },
      },
    },
    reservations: {
      include: {
        participations: true,
      },
    },
  });

export type PrismaOpportunitySlot = Prisma.OpportunitySlotGetPayload<{
  include: typeof opportunitySlotInclude;
}>;

export type PrismaOpportunitySlotWithParticipation = Prisma.OpportunitySlotGetPayload<{
  include: typeof opportunitySlotWithParticipationInclude;
}>;
