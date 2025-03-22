import {
  GqlParticipationCreatePersonalRecordInput,
  GqlParticipationFilterInput,
  GqlParticipationSortInput,
} from "@/types/graphql";
import { ParticipationStatus, ParticipationStatusReason, Prisma } from "@prisma/client";

export default class ParticipationConverter {
  static filter(filter?: GqlParticipationFilterInput): Prisma.ParticipationWhereInput {
    return {
      AND: [
        filter?.status ? { status: filter?.status } : {},
        filter?.communityId ? { communityId: filter?.communityId } : {},
        filter?.userId ? { userId: filter?.userId } : {},
        filter?.opportunitySlotId ? { opportunitySlotId: filter?.opportunitySlotId } : {},
      ],
    };
  }

  static sort(sort?: GqlParticipationSortInput): Prisma.ParticipationOrderByWithRelationInput[] {
    return [
      { createdAt: sort?.createdAt ?? Prisma.SortOrder.desc },
      { updatedAt: sort?.updatedAt ?? Prisma.SortOrder.desc },
    ];
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
