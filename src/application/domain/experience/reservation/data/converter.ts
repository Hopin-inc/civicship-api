import { GqlReservationFilterInput, GqlReservationSortInput } from "@/types/graphql";
import {
  ParticipationStatus,
  ParticipationStatusReason,
  Prisma,
  ReservationStatus,
} from "@prisma/client";
import { ReservationStatuses } from "@/application/domain/experience/reservation/helper";
import { injectable } from "tsyringe";

@injectable()
export default class ReservationConverter {
  filter(filter?: GqlReservationFilterInput): Prisma.ReservationWhereInput {
    const resolve = (input?: GqlReservationFilterInput): Prisma.ReservationWhereInput => {
      if (!input) return {};

      const conditions: Prisma.ReservationWhereInput[] = [];

      if (input.reservationStatus?.length) {
        conditions.push({ status: { in: input.reservationStatus } });
      }

      if (input.hostingStatus?.length) {
        conditions.push({ opportunitySlot: { hostingStatus: { in: input.hostingStatus } } });
      }

      if (input.participationStatus?.length) {
        conditions.push({
          participations: {
            some: { status: { in: input.participationStatus } },
          },
        });
      }

      if (input.evaluationStatus) {
        conditions.push({
          participations: {
            some: {
              evaluation: {
                status: input.evaluationStatus,
              },
            },
          },
        });
      }

      if (input.opportunityId) {
        conditions.push({ opportunitySlot: { opportunityId: input.opportunityId } });
      }

      if (input.opportunitySlotId) {
        conditions.push({ opportunitySlotId: input.opportunitySlotId });
      }

      if (input.createdByUserId) {
        conditions.push({ createdBy: input.createdByUserId });
      }

      if (input.opportunityOwnerId) {
        conditions.push({
          opportunitySlot: { opportunity: { createdBy: input.opportunityOwnerId } },
        });
      }

      if (input.communityId) {
        conditions.push({
          opportunitySlot: { opportunity: { communityId: input.communityId } },
        });
      }

      const and = input.and?.map(resolve).filter(Boolean);
      if (and?.length) {
        conditions.push({ AND: and });
      }

      const or = input.or?.map(resolve).filter(Boolean);
      if (or?.length) {
        conditions.push({ OR: or });
      }

      const not = input.not?.map(resolve).filter(Boolean);
      if (not?.length) {
        conditions.push({ NOT: not });
      }

      return conditions.length ? { AND: conditions } : {};
    };

    return resolve(filter);
  }

  sort(sort?: GqlReservationSortInput): Prisma.ReservationOrderByWithRelationInput[] {
    return [
      { createdAt: sort?.createdAt ?? Prisma.SortOrder.desc },
      ...(sort?.updatedAt ? [{ updatedAt: sort.updatedAt }] : []),
    ];
  }

  checkConflict(userId: string, slotId: string): Prisma.ReservationWhereInput {
    return {
      createdBy: userId,
      status: {
        notIn: [ReservationStatus.REJECTED, ReservationStatus.CANCELED],
      },
      opportunitySlotId: slotId,
    };
  }

  create(
    opportunitySlotId: string,
    currentUserId: string,
    participantCount: number,
    userIdsIfExists: string[],
    { reservationStatus, participationStatus, participationStatusReason }: ReservationStatuses,
    comment?: string,
    communityId?: string,
    participantCountWithPoints?: number,
  ): Prisma.ReservationCreateInput {
    const userIds = [currentUserId, ...userIdsIfExists];

    const participations = createParticipations(
      currentUserId,
      userIds,
      participantCount,
      participationStatus,
      participationStatusReason,
      communityId,
    );

    return {
      status: reservationStatus,
      comment,
      opportunitySlot: { connect: { id: opportunitySlotId } },
      createdByUser: { connect: { id: currentUserId } },
      participations: { create: participations },
      histories: {
        create: {
          status: reservationStatus,
          createdByUser: { connect: { id: currentUserId } },
        },
      },
      participantCountWithPoint: participantCountWithPoints ?? 0,
    };
  }

  setStatus(currentUserId: string, status: ReservationStatus): Prisma.ReservationUpdateInput {
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
  communityId?: string,
): Prisma.ParticipationCreateWithoutReservationInput[] {
  const results: Prisma.ParticipationCreateWithoutReservationInput[] = [];

  for (let i = 0; i < count; i++) {
    results.push(createParticipationInput(currentUserId, userIds[i], status, reason, communityId));
  }

  return results;
}

function createParticipationInput(
  currentUserId: string,
  userId: string | undefined,
  status: ParticipationStatus,
  reason: ParticipationStatusReason,
  communityId?: string,
): Prisma.ParticipationCreateWithoutReservationInput {
  return {
    status,
    reason,
    ...(userId && {
      user: { connect: { id: userId } },
    }),
    ...(communityId && {
      community: { connect: { id: communityId } },
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
