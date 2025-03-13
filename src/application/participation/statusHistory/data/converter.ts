import {
  GqlParticipationStatusHistoryFilterInput,
  GqlParticipationStatusHistorySortInput,
} from "@/types/graphql";
import { Prisma } from "@prisma/client";

export default class ParticipationStatusHistoryInputFormat {
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
}
