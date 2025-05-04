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

export const opportunitySlotSelectDetail = Prisma.validator<Prisma.OpportunitySlotSelect>()({
  id: true,
  hostingStatus: true,
  opportunityId: true,
  startsAt: true,
  endsAt: true,
  capacity: true,
  createdAt: true,
  updatedAt: true,
  remainingCapacityView: { select: { remainingCapacity: true } },
  reservations: { select: { id: true } },
});

export const opportunitySlotWithParticipationSelectDetail =
  Prisma.validator<Prisma.OpportunitySlotSelect>()({
    id: true,
    hostingStatus: true,
    startsAt: true,
    endsAt: true,
    capacity: true,
    remainingCapacityView: { select: { remainingCapacity: true } },
    opportunityId: true,
    reservations: { select: { id: true } },
    createdAt: true,
    updatedAt: true,
  });

export type PrismaOpportunitySlot = Prisma.OpportunitySlotGetPayload<{
  include: typeof opportunitySlotInclude;
}>;

export type PrismaOpportunitySlotWithParticipation = Prisma.OpportunitySlotGetPayload<{
  include: typeof opportunitySlotWithParticipationInclude;
}>;

export type PrismaOpportunitySlotDetail = Prisma.OpportunitySlotGetPayload<{
  select: typeof opportunitySlotSelectDetail;
}>;

export type PrismaOpportunitySlotWithParticipationDetail = Prisma.OpportunitySlotGetPayload<{
  select: typeof opportunitySlotWithParticipationSelectDetail;
}>;
