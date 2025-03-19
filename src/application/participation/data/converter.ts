import {
  GqlParticipationFilterInput,
  GqlParticipationSortInput,
  GqlParticipationApplyInput,
  GqlParticipationInviteInput,
} from "@/types/graphql";
import {
  ParticipationEventTrigger,
  ParticipationEventType,
  ParticipationStatus,
  Prisma,
} from "@prisma/client";

export default class ParticipationConverter {
  static filter(filter?: GqlParticipationFilterInput): Prisma.ParticipationWhereInput {
    return {
      AND: [
        filter?.status ? { status: filter?.status } : {},
        filter?.communityId ? { communityId: filter?.communityId } : {},
        filter?.userId ? { userId: filter?.userId } : {},
        filter?.opportunityId ? { opportunityId: filter?.opportunityId } : {},
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

  static invite(
    { opportunityId, invitedUserId, communityId }: GqlParticipationInviteInput,
    currentUserId: string,
  ): Prisma.ParticipationCreateInput {
    return {
      status: ParticipationStatus.PENDING,
      eventType: ParticipationEventType.INVITATION,
      eventTrigger: ParticipationEventTrigger.ISSUED,
      community: { connect: { id: communityId } },
      user: { connect: { id: invitedUserId } },
      opportunity: { connect: { id: opportunityId } },
      statusHistories: {
        create: {
          status: ParticipationStatus.PENDING,
          eventType: ParticipationEventType.INVITATION,
          eventTrigger: ParticipationEventTrigger.ISSUED,
          createdByUser: { connect: { id: currentUserId } },
        },
      },
    };
  }

  static apply(
    { opportunityId }: GqlParticipationApplyInput,
    currentUserId: string,
    communityId: string,
    status: ParticipationStatus,
  ): Prisma.ParticipationCreateInput {
    return {
      status,
      eventType: ParticipationEventType.APPLICATION,
      eventTrigger: ParticipationEventTrigger.ISSUED,
      community: { connect: { id: communityId } },
      user: { connect: { id: currentUserId } },
      opportunity: { connect: { id: opportunityId } },
      statusHistories: {
        create: {
          status,
          eventType: ParticipationEventType.APPLICATION,
          eventTrigger: ParticipationEventTrigger.ISSUED,
          createdByUser: { connect: { id: currentUserId } },
        },
      },
    };
  }

  static setStatus(
    currentUserId: string,
    status: ParticipationStatus,
    eventType: ParticipationEventType,
    eventTrigger: ParticipationEventTrigger,
  ): Prisma.ParticipationUpdateInput {
    return {
      status,
      eventType,
      eventTrigger,
      statusHistories: {
        create: {
          status,
          eventType,
          eventTrigger,
          createdByUser: { connect: { id: currentUserId } },
        },
      },
    };
  }
}
