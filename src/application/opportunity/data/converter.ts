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
        filter?.category ? { category: filter.category } : {},
        filter?.publishStatus ? { publishStatus: filter.publishStatus } : {},
        filter?.communityIds ? { communityId: { in: filter.communityIds } } : {},
        filter?.createdByUserIds ? { createdBy: { in: filter.createdByUserIds } } : {},
        filter?.placeIds ? { placeId: { in: filter.placeIds } } : {},
        filter?.cityCodes ? { place: { cityCode: { in: filter.cityCodes } } } : {},
        filter?.articleIds ? { articles: { some: { id: { in: filter.articleIds } } } } : {},
        filter?.requiredUtilityIds
          ? { requiredUtilities: { some: { id: { in: filter.requiredUtilityIds } } } }
          : {},
      ],
    };
  }

  static sort(sort?: GqlOpportunitySortInput): Prisma.OpportunityOrderByWithRelationInput[] {
    return [
      { startsAt: sort?.startsAt ?? Prisma.SortOrder.desc },
      { createdAt: sort?.createdAt ?? Prisma.SortOrder.desc },
    ];
  }

  // TODO place登録のためのデータ整形
  static create(
    input: GqlOpportunityCreateInput,
    currentUserId: string,
  ): Prisma.OpportunityCreateInput {
    const { communityId, ...prop } = input;

    return {
      ...prop,
      image: input.image?.base64,
      community: { connect: { id: communityId } },
      createdByUser: { connect: { id: currentUserId } },
    };
  }

  // TODO place登録のためのデータ整形
  static update(input: GqlOpportunityUpdateContentInput): Prisma.OpportunityUpdateInput {
    return {
      ...input,
      image: input.image?.base64,
    };
  }
}
