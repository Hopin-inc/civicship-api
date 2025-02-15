import {
  GqlOpportunityCreateInput,
  GqlOpportunityFilterInput,
  GqlOpportunitySortInput,
  GqlOpportunityUpdateContentInput,
} from "@/types/graphql";
import { Prisma } from "@prisma/client";

export default class OpportunityInputFormat {
  static filter(filter?: GqlOpportunityFilterInput): Prisma.OpportunityWhereInput {
    return {
      AND: [
        filter?.category ? { category: filter?.category } : {},
        filter?.publishStatus ? { publishStatus: filter?.publishStatus } : {},
        filter?.communityId ? { communityId: filter?.communityId } : {},
        filter?.createdByUserId ? { createdBy: filter?.createdByUserId } : {},
      ],
    };
  }

  static sort(sort?: GqlOpportunitySortInput): Prisma.OpportunityOrderByWithRelationInput[] {
    return [
      { startsAt: sort?.startsAt ?? Prisma.SortOrder.desc },
      { pointsRequired: sort?.pointsRequired ?? Prisma.SortOrder.desc },
      { createdAt: sort?.createdAt ?? Prisma.SortOrder.desc },
    ];
  }

  static create(
    input: GqlOpportunityCreateInput,
    currentUserId: string,
  ): Prisma.OpportunityCreateInput {
    const { communityId, placeId, ...properties } = input;

    return {
      ...properties,
      community: { connect: { id: communityId } },
      createdByUser: { connect: { id: currentUserId } },
      place: { connect: { id: placeId } },
    };
  }

  // TODO updatedByUserをDBに加えるか判断
  static update(input: GqlOpportunityUpdateContentInput): Prisma.OpportunityUpdateInput {
    return {
      ...input,
    };
  }
}
