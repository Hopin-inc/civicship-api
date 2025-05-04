import { Prisma } from "@prisma/client";

export const opportunitySlotSetHostingStatusInclude =
  Prisma.validator<Prisma.OpportunitySlotInclude>()({
    opportunity: { include: { createdByUser: { include: { image: true } } } },
    reservations: { include: { participations: true } },
  });

export const opportunitySlotReserveInclude = Prisma.validator<Prisma.OpportunitySlotInclude>()({
  opportunity: { include: { requiredUtilities: true } },
  reservations: { include: { participations: true } },
  remainingCapacityView: true,
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

export type PrismaOpportunitySlotSetHostingStatus = Prisma.OpportunitySlotGetPayload<{
  include: typeof opportunitySlotSetHostingStatusInclude;
}>;

export type PrismaOpportunitySlotReserve = Prisma.OpportunitySlotGetPayload<{
  include: typeof opportunitySlotReserveInclude;
}>;

export type PrismaOpportunitySlotDetail = Prisma.OpportunitySlotGetPayload<{
  select: typeof opportunitySlotSelectDetail;
}>;
