import {
  GqlParticipationStatusHistoryFilterInput,
  GqlParticipationStatusHistorySortInput,
} from "@/types/graphql";
import {
  ParticipationEventTrigger,
  ParticipationEventType,
  ParticipationStatus,
  Prisma,
} from "@prisma/client";

export default class ParticipationStatusHistoryConverter {
  static filter(
    filter?: GqlParticipationStatusHistoryFilterInput,
  ): Prisma.ParticipationStatusHistoryWhereInput {
    return {
      AND: [
        filter?.participationId ? { participationId: filter?.participationId } : {},
        filter?.createdById ? { createdBy: filter?.createdById } : {},
        filter?.status ? { status: filter?.status } : {},
      ],
    };
  }

  static sort(
    sort?: GqlParticipationStatusHistorySortInput,
  ): Prisma.ParticipationStatusHistoryOrderByWithRelationInput[] {
    return [{ createdAt: sort?.createdAt ?? Prisma.SortOrder.desc }];
  }

  static bulkCreateStatusHistoriesForCancelledOpportunity(
    participationIds: string[],
    currentUserId: string,
  ): Prisma.ParticipationStatusHistoryCreateManyInput[] {
    return participationIds.map((participationId) => ({
      participationId,
      status: ParticipationStatus.NOT_PARTICIPATING,
      eventType: ParticipationEventType.OPPORTUNITY,
      eventTrigger: ParticipationEventTrigger.CANCELED,
      createdByUserId: currentUserId,
    }));
  }
}
