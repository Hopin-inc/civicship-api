import { GqlReservationFilterInput, GqlReservationSortInput } from "@/types/graphql";
import {
  ParticipationStatus,
  ParticipationStatusReason,
  Prisma,
  ReservationStatus,
} from "@prisma/client";
import { ReservationStatuses } from "@/application/domain/reservation/type";

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

    const participations = this.createParticipations(
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

  private static createParticipations(
    currentUserId: string,
    userIds: (string | undefined)[],
    count: number,
    status: ParticipationStatus,
    reason: ParticipationStatusReason,
  ): Prisma.ParticipationCreateWithoutReservationInput[] {
    return Array.from({ length: count }, (_, i) =>
      this.createParticipationInput(currentUserId, userIds[i], status, reason),
    );
  }

  private static createParticipationInput(
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
}
