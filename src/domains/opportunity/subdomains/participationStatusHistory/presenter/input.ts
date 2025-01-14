import {
  GqlParticipationFilterInput,
  GqlParticipationSortInput,
  GqlParticipationStatusHistoryCreateInput,
} from "@/types/graphql";
import { Prisma } from "@prisma/client";

export default class ParticipationStatusHistoryInputFormat {
  static filter(filter?: GqlParticipationFilterInput): Prisma.ParticipationWhereInput {
    return {
      AND: [
        filter?.status ? { status: filter?.status } : {},
        filter?.communityId ? { communityId: filter?.communityId } : {},
        filter?.userId ? { userId: filter?.userId } : {},
        filter?.opportunityId ? { opportunityId: filter?.opportunityId } : {},
      ],
    };
  }

  static sort(sort?: GqlParticipationSortInput): Prisma.ParticipationOrderByWithRelationInput[] {
    return [
      { createdAt: sort?.createdAt ?? Prisma.SortOrder.desc },
      { updatedAt: sort?.updatedAt ?? Prisma.SortOrder.desc },
    ];
  }

  static create(
    input: GqlParticipationStatusHistoryCreateInput,
  ): Prisma.ParticipationStatusHistoryCreateInput {
    const { participationId, createdById, status, ...properties } = input;

    return {
      ...properties,
      status,
      participation: { connect: { id: participationId } },
      createdByUser: { connect: { id: createdById } },
    };
  }
}
