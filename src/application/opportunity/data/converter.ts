import {
  GqlOpportunityCreateInput,
  GqlOpportunityFilterInput,
  GqlOpportunitySortInput,
  GqlOpportunityUpdateContentInput,
} from "@/types/graphql";
import { Prisma } from "@prisma/client";
import { ValidationError } from "@/errors/graphql";

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

  //TODO usecase層でplaceの有無確認する
  static create(
    input: GqlOpportunityCreateInput,
    currentUserId: string,
  ): Prisma.OpportunityCreateInput {
    const { place, communityId, ...prop } = input;

    if ((place.where && place.create) || (!place.where && !place.create)) {
      throw new ValidationError(
        `For Place, please specify only one of either 'where' or 'create'. Received: ${JSON.stringify(place)}`,
      );
    }

    const finalPlace = place.where
      ? { connect: { id: place.where } }
      : (() => {
          const { cityCode, communityId, ...restCreate } = place.create!;
          return {
            create: {
              ...restCreate,
              city: { connect: { code: cityCode } },
              community: { connect: { id: communityId } },
            },
          };
        })();

    return {
      ...prop,
      image: input.image?.base64,
      community: { connect: { id: communityId } },
      createdByUser: { connect: { id: currentUserId } },
      place: finalPlace,
    };
  }

  static update(input: GqlOpportunityUpdateContentInput): Prisma.OpportunityUpdateInput {
    const { place, image, ...prop } = input;

    let finalPlace: Prisma.OpportunityUpdateInput["place"] | undefined;

    if (place) {
      if ((place.where && place.create) || (!place.where && !place.create)) {
        throw new ValidationError(
          `For Place, please specify only one of either 'where' or 'create'. Received: ${JSON.stringify(place)}`,
        );
      }
      finalPlace = place.where
        ? { connect: { id: place.where } }
        : (() => {
            const { cityCode, communityId, ...restCreate } = place.create!;
            return {
              create: {
                ...restCreate,
                city: { connect: { code: cityCode } },
                community: { connect: { id: communityId } },
              },
            };
          })();
    }

    return {
      ...prop,
      image: image?.base64,
      ...(finalPlace ? { place: finalPlace } : {}),
    };
  }
}
