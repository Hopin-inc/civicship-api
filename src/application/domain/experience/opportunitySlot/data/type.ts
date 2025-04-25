import { Prisma } from "@prisma/client";
import { userInclude } from "@/application/domain/account/user/data/type";

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
  remainingCapacityView: true,
});

export const opportunitySlotWithParticipationInclude =
  Prisma.validator<Prisma.OpportunitySlotInclude>()({
    opportunity: {
      include: {
        requiredUtilities: {
          include: { community: true },
        },
        createdByUser: { include: userInclude },
      },
    },
    remainingCapacityView: true,
    reservations: {
      include: {
        participations: {
          include: {
            user: {
              include: {
                identities: true,
              },
            },
          },
        },
      },
    },
  });

export type PrismaOpportunitySlot = Prisma.OpportunitySlotGetPayload<{
  include: typeof opportunitySlotInclude;
}>;

export type PrismaOpportunitySlotWithParticipation = Prisma.OpportunitySlotGetPayload<{
  include: typeof opportunitySlotWithParticipationInclude;
}>;
