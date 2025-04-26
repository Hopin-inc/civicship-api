import { GqlReservationFilterInput, GqlReservationSortInput } from "@/types/graphql";
import {
  OpportunityCategory,
  ParticipationStatus,
  ParticipationStatusReason,
  Prisma,
  ReservationStatus,
} from "@prisma/client";
import { ReservationStatuses } from "@/application/domain/experience/reservation/helper";

export default class ReservationConverter {
  static filter(filter?: GqlReservationFilterInput): Prisma.ReservationWhereInput {
    const conditions: Prisma.ReservationWhereInput[] = [];
    if (!filter) return {};

    if (filter.status) conditions.push({ status: filter.status });
    if (filter.opportunityId)
      conditions.push({
        opportunitySlot: { opportunityId: filter.opportunityId },
      });
    if (filter.opportunitySlotId)
      conditions.push({
        opportunitySlotId: filter.opportunitySlotId,
      });
    if (filter.createdByUserId) conditions.push({ createdBy: filter.createdByUserId });

    return conditions.length ? { AND: conditions } : {};
  }

  static countByUserAndOpportunityCategory(
    userId: string,
    category: OpportunityCategory,
  ): Prisma.ReservationWhereInput {
    return {
      createdBy: userId,
      opportunitySlot: {
        opportunity: {
          category,
        },
      },
    };
  }

  static sort(sort?: GqlReservationSortInput): Prisma.ReservationOrderByWithRelationInput[] {
    return [
      { createdAt: sort?.createdAt ?? Prisma.SortOrder.desc },
      ...(sort?.updatedAt ? [{ updatedAt: sort.updatedAt }] : []),
    ];
  }

  static checkConflict(userId: string, slotId: string): Prisma.ReservationWhereInput {
    return {
      createdBy: userId,
      status: {
        notIn: [ReservationStatus.REJECTED, ReservationStatus.CANCELED],
      },
      opportunitySlot: {
        id: slotId,
      },
    };
  }

  static create(
    opportunitySlotId: string,
    currentUserId: string,
    participantCount: number,
    userIdsIfExists: string[],
    { reservationStatus, participationStatus, participationStatusReason }: ReservationStatuses,
  ): Prisma.ReservationCreateInput {
    const userIds = [currentUserId, ...userIdsIfExists];

    const participations = createParticipations(
      currentUserId,
      userIds,
      participantCount,
      participationStatus,
      participationStatusReason,
    );

    return {
      status: reservationStatus,
      opportunitySlot: { connect: { id: opportunitySlotId } },
      createdByUser: { connect: { id: currentUserId } },
      participations: { create: participations },
      histories: {
        create: {
          status: reservationStatus,
          createdByUser: { connect: { id: currentUserId } },
        },
      },
    };
  }

  static setStatus(
    currentUserId: string,
    status: ReservationStatus,
  ): Prisma.ReservationUpdateInput {
    return {
      status,
      histories: {
        create: {
          status,
          createdByUser: { connect: { id: currentUserId } },
        },
      },
    };
  }
}

function createParticipations(
  currentUserId: string,
  userIds: (string | undefined)[],
  count: number,
  status: ParticipationStatus,
  reason: ParticipationStatusReason,
): Prisma.ParticipationCreateWithoutReservationInput[] {
  const results: Prisma.ParticipationCreateWithoutReservationInput[] = [];

  for (let i = 0; i < count; i++) {
    results.push(createParticipationInput(currentUserId, userIds[i], status, reason));
  }

  return results;
}

function createParticipationInput(
  currentUserId: string,
  userId: string | undefined,
  status: ParticipationStatus,
  reason: ParticipationStatusReason,
): Prisma.ParticipationCreateWithoutReservationInput {
  return {
    status,
    reason,
    ...(userId && {
      user: { connect: { id: userId } },
    }),
    statusHistories: {
      create: {
        status,
        reason,
        createdByUser: { connect: { id: currentUserId } },
      },
    },
  };
}
