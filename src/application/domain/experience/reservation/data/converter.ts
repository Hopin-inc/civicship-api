import { 
  GqlReservationFilterInput, 
  GqlReservationSortInput,
  GqlOpportunityCategory as OpportunityCategory,
  GqlParticipationStatus as ParticipationStatus,
  GqlParticipationStatusReason as ParticipationStatusReason,
  GqlReservationStatus as ReservationStatus
} from "@/types/graphql";
import { ReservationStatuses } from "@/application/domain/experience/reservation/helper";
import { injectable } from "tsyringe";

@injectable()
export default class ReservationConverter {
  filter(filter?: GqlReservationFilterInput): any {
    const conditions: any[] = [];
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

  countByUserAndOpportunityCategory(
    userId: string,
    category: OpportunityCategory,
  ): any {
    return {
      createdBy: userId,
      opportunitySlot: {
        opportunity: {
          category,
        },
      },
    };
  }

  sort(sort?: GqlReservationSortInput): any[] {
    return [
      { createdAt: sort?.createdAt ?? 'desc' },
      ...(sort?.updatedAt ? [{ updatedAt: sort.updatedAt }] : []),
    ];
  }

  checkConflict(userId: string, slotId: string): any {
    return {
      createdBy: userId,
      status: {
        notIn: [ReservationStatus.Rejected, ReservationStatus.Canceled],
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
  ): any {
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

  setStatus(currentUserId: string, status: ReservationStatus): any {
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
): any[] {
  const results: any[] = [];

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
): any {
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
