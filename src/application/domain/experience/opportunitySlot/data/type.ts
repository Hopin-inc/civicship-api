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
  opportunityId: true,
  startAt: true,
  endAt: true,
  capacity: true,
  createdAt: true,
  updatedAt: true,
  opportunity: { 
    select: { 
      id: true,
      name: true,
      description: true,
      requiredUtilities: { 
        select: { 
          id: true,
          communityId: true,
          community: { select: { id: true } }
        } 
      }
    } 
  },
  remainingCapacityView: { select: { id: true, remainingCapacity: true } },
  reservations: { select: { id: true } }
});

export const opportunitySlotWithParticipationSelectDetail = 
  Prisma.validator<Prisma.OpportunitySlotSelect>()({
    id: true,
    opportunityId: true,
    startAt: true,
    endAt: true,
    capacity: true,
    createdAt: true,
    updatedAt: true,
    opportunity: { 
      select: { 
        id: true,
        name: true,
        description: true,
        requiredUtilities: { 
          select: { 
            id: true,
            communityId: true,
            community: { select: { id: true } }
          } 
        },
        createdByUserId: true,
        createdByUser: { select: { id: true } }
      } 
    },
    remainingCapacityView: { select: { id: true, remainingCapacity: true } },
    reservations: { 
      select: { 
        id: true,
        participations: { 
          select: { 
            id: true,
            userId: true,
            user: { select: { id: true, identities: { select: { id: true } } } }
          } 
        }
      } 
    }
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
