import {
  GqlOpportunityCreateInput,
  GqlOpportunityFilterInput,
  GqlOpportunitySortInput,
} from "@/types/graphql";
import { Prisma } from "@prisma/client";

export default class OpportunityInputFormat {
  static filter(filter?: GqlOpportunityFilterInput): Prisma.OpportunityWhereInput {
    return {
      AND: [
        filter?.category ? { category: filter?.category } : {},
        filter?.publishStatus ? { publishStatus: filter?.publishStatus } : {},
        filter?.communityId ? { communityId: filter?.communityId } : {},
        filter?.createdBy ? { createdBy: filter?.createdBy } : {},
        filter?.stateCode ? { stateCode: filter?.stateCode } : {},
        filter?.cityCode ? { cityCode: filter?.cityCode } : {},
      ],
    };
  }

  static sort(sort?: GqlOpportunitySortInput): Prisma.OpportunityOrderByWithRelationInput[] {
    return [
      { startsAt: sort?.startsAt ?? Prisma.SortOrder.desc },
      { pointsPerParticipation: sort?.pointsPerParticipation ?? Prisma.SortOrder.desc },
      { createdAt: sort?.createdAt ?? Prisma.SortOrder.desc },
    ];
  }

  static create(input: GqlOpportunityCreateInput): Prisma.OpportunityCreateInput {
    const { communityId, cityCode, createdById, ...properties } = input;

    return {
      ...properties,
      community: { connect: { id: communityId } },
      createdByUser: { connect: { id: createdById } },
      city: { connect: { code: cityCode } },
    };
  }
}
