import {
  GqlParticipationFilterInput,
  GqlParticipationSortInput,
  GqlParticipationApplyInput,
  GqlParticipationInviteInput,
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

  static invite(input: GqlParticipationInviteInput): Prisma.ParticipationCreateInput {
    const { communityId, opportunityId, invitedUserId, ...properties } = input;

    return {
      ...properties,
      status: ParticipationStatus.APPLIED,
      community: { connect: { id: communityId } },
      user: { connect: { id: invitedUserId } },
      opportunity: { connect: { id: opportunityId } },
    };
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
