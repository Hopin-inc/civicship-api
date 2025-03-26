import {
  GqlParticipationCreatePersonalRecordInput,
  GqlParticipationFilterInput,
  GqlParticipationSortInput,
} from "@/types/graphql";
import {
  OpportunityCategory,
  ParticipationStatus,
  ParticipationStatusReason,
  Prisma,
} from "@prisma/client";

export default class ParticipationConverter {
  static filter(filter?: GqlParticipationFilterInput): Prisma.ParticipationWhereInput {
    return {
      AND: [
        filter?.userIds ? { userId: { in: filter.userIds } } : {},
        filter?.categories && filter.categories.length
          ? {
              opportunitySlot: {
                opportunity: {
                  category: { in: filter.categories.filter(isOpportunityCategory) },
                },
              },
            }
          : {},
        filter?.dateFrom || filter?.dateTo
          ? {
              opportunitySlot: {
                startsAt: {
                  ...(filter.dateFrom ? { gte: filter.dateFrom } : {}),
                  ...(filter.dateTo ? { lte: filter.dateTo } : {}),
                },
              },
            }
          : {},
        filter?.cityCodes
          ? {
              opportunitySlot: {
                opportunity: { place: { city: { code: { in: filter.cityCodes } } } },
              },
            }
          : {},
        filter?.stateCodes
          ? {
              opportunitySlot: {
                opportunity: { place: { city: { state: { code: { in: filter.stateCodes } } } } },
              },
            }
          : {},
        // 他の既存項目も残す
        filter?.status ? { status: filter.status } : {},
        filter?.communityId ? { communityId: filter.communityId } : {},
        filter?.opportunityId ? { opportunitySlot: { opportunityId: filter.opportunityId } } : {},
        filter?.opportunitySlotId ? { opportunitySlotId: filter.opportunitySlotId } : {},
        filter?.reservationId ? { reservationId: filter.reservationId } : {},
        filter?.opportunityInvitationId
          ? { opportunityInvitationHistory: { invitationId: filter.opportunityInvitationId } }
          : {},
      ],
    };
  }

  static sort(sort?: GqlParticipationSortInput): Prisma.ParticipationOrderByWithRelationInput[] {
    return [{ opportunitySlot: { startsAt: sort?.startsAt ?? "desc" } }, { createdAt: "desc" }];
  }

  static countActiveBySlotId(slotId: string): Prisma.ParticipationWhereInput {
    return {
      opportunitySlotId: slotId,
      status: {
        notIn: [ParticipationStatus.NOT_PARTICIPATING],
      },
    };
  }

  static countPersonalRecords(userId: string): Prisma.ParticipationWhereInput {
    return {
      userId,
      status: ParticipationStatus.PARTICIPATED,
      reason: ParticipationStatusReason.PERSONAL_RECORD,
    };
  }

  static create(
    input: GqlParticipationCreatePersonalRecordInput,
    currentUserId: string,
  ): Prisma.ParticipationCreateInput {
    return {
      status: ParticipationStatus.PARTICIPATED,
      reason: ParticipationStatusReason.PERSONAL_RECORD,
      description: input.description ?? null,
      user: { connect: { id: currentUserId } },
      statusHistories: {
        create: {
          status: ParticipationStatus.PARTICIPATED,
          reason: ParticipationStatusReason.PERSONAL_RECORD,
          createdByUser: { connect: { id: currentUserId } },
        },
      },
    };
  }

  static setStatus(
    currentUserId: string,
    status: ParticipationStatus,
    reason: ParticipationStatusReason,
  ): Prisma.ParticipationUpdateInput {
    return {
      status,
      reason,
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

function isOpportunityCategory(value: string): value is OpportunityCategory {
  return ["QUEST", "EVENT", "ACTIVITY"].includes(value);
}
