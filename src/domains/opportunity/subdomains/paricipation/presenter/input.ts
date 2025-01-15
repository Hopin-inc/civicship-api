import {
  GqlParticipationFilterInput,
  GqlParticipationSortInput,
  GqlParticipationApplyInput,
} from "@/types/graphql";
import { ParticipationStatus, Prisma } from "@prisma/client";

export default class ParticipationInputFormat {
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

  static apply(
    input: GqlParticipationApplyInput,
    currentUserId: string,
  ): Prisma.ParticipationCreateInput {
    const { communityId, opportunityId, ...properties } = input;

    return {
      ...properties,
      status: ParticipationStatus.APPLIED,
      community: { connect: { id: communityId } },
      user: { connect: { id: currentUserId } },
      opportunity: { connect: { id: opportunityId } },
    };
  }
}
