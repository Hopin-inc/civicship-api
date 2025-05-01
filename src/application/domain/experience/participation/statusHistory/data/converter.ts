import {
  GqlParticipationStatusHistoryFilterInput,
  GqlParticipationStatusHistorySortInput,
} from "@/types/graphql";
import { ParticipationStatus, ParticipationStatusReason, Prisma } from "@prisma/client";
import { injectable } from "tsyringe";

@injectable()
export default class ParticipationStatusHistoryConverter {
  filter(
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

  sort(
    sort?: GqlParticipationStatusHistorySortInput,
  ): Prisma.ParticipationStatusHistoryOrderByWithRelationInput[] {
    return [{ createdAt: sort?.createdAt ?? Prisma.SortOrder.desc }];
  }

  createMany(
    participationIds: string[],
    currentUserId: string,
    status: ParticipationStatus,
    reason: ParticipationStatusReason,
  ): Prisma.ParticipationStatusHistoryCreateManyInput[] {
    return participationIds.map((participationId) => ({
      participationId,
      status,
      reason,
      createdBy: currentUserId,
    }));
  }
}
