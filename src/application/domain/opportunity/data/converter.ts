import {
  GqlOpportunityCreateInput,
  GqlOpportunityFilterInput,
  GqlOpportunitySortInput,
  GqlOpportunityUpdateContentInput,
} from "@/types/graphql";
import { Prisma } from "@prisma/client";

export default class OpportunityConverter {
  static filter(filter?: GqlOpportunityFilterInput): Prisma.OpportunityWhereInput {
    if (!filter) return {};

    const conditions: Prisma.OpportunityWhereInput[] = [
      ...this.opportunityFilter(filter),
      ...this.opportunitySlotFilter(filter),
    ];

    if (filter.and?.length) {
      conditions.push({
        AND: filter.and.map((sub) => this.filter(sub)),
      });
    }

    if (filter.or?.length) {
      conditions.push({
        OR: filter.or.map((sub) => this.filter(sub)),
      });
    }

    if (filter.not) {
      conditions.push({
        NOT: this.filter(filter.not),
      });
    }

    return conditions.length ? { AND: conditions } : {};
  }

  static sort(sort?: GqlOpportunitySortInput): Prisma.OpportunityOrderByWithRelationInput[] {
    return [{ createdAt: sort?.createdAt ?? Prisma.SortOrder.desc }];
  }

  static findAccessible(
    id: string,
    filter?: GqlOpportunityFilterInput,
  ): Prisma.OpportunityWhereUniqueInput & Prisma.OpportunityWhereInput {
    const validatedFilter = this.filter(filter);
    return {
      id,
      ...(validatedFilter.AND ? { AND: validatedFilter.AND } : {}),
    };
  }

  static create(
    input: GqlOpportunityCreateInput,
    currentUserId: string,
  ): Prisma.OpportunityCreateInput {
    const { place, image, communityId, ...prop } = input;

    let finalPlace: Prisma.PlaceCreateNestedOneWithoutOpportunitiesInput | undefined;

    if (place) {
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
      community: { connect: { id: communityId } },
      createdByUser: { connect: { id: currentUserId } },
      ...(finalPlace ? { place: finalPlace } : {}),
    };
  }

  static update(input: GqlOpportunityUpdateContentInput): Prisma.OpportunityUpdateInput {
    const { place, image, ...prop } = input;

    let finalPlace: Prisma.PlaceUpdateOneWithoutOpportunitiesNestedInput | undefined = undefined;

    if (place) {
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

  private static opportunityFilter(
    filter: GqlOpportunityFilterInput,
  ): Prisma.OpportunityWhereInput[] {
    const conditions: Prisma.OpportunityWhereInput[] = [];

    if (filter.category) conditions.push({ category: filter.category });
    if (filter.publishStatus?.length)
      conditions.push({ publishStatus: { in: filter.publishStatus } });
    if (filter.communityIds?.length) conditions.push({ communityId: { in: filter.communityIds } });
    if (filter.createdByUserIds?.length)
      conditions.push({ createdBy: { in: filter.createdByUserIds } });
    if (filter.placeIds?.length) conditions.push({ placeId: { in: filter.placeIds } });
    if (filter.cityCodes?.length)
      conditions.push({ place: { cityCode: { in: filter.cityCodes } } });
    if (filter.articleIds?.length)
      conditions.push({ articles: { some: { id: { in: filter.articleIds } } } });
    if (filter.requiredUtilityIds?.length)
      conditions.push({ requiredUtilities: { some: { id: { in: filter.requiredUtilityIds } } } });

    return conditions;
  }

  private static opportunitySlotFilter(
    filter: GqlOpportunityFilterInput,
  ): Prisma.OpportunityWhereInput[] {
    const slotConditions: Prisma.OpportunitySlotWhereInput[] = [];

    if (filter.slotHostingStatus?.length)
      slotConditions.push({ hostingStatus: { in: filter.slotHostingStatus } });

    if (filter.slotStartsAt && filter.slotEndsAt) {
      slotConditions.push({
        startsAt: { lte: filter.slotEndsAt },
        endsAt: { gte: filter.slotStartsAt },
      });
    } else {
      if (filter.slotStartsAt) {
        slotConditions.push({ startsAt: { gte: filter.slotStartsAt } });
      }
      if (filter.slotEndsAt) {
        slotConditions.push({ endsAt: { lte: filter.slotEndsAt } });
      }
    }

    if (filter.slotRemainingCapacity != null) {
      slotConditions.push({
        remainingCapacityView: {
          is: {
            OR: [
              { remainingCapacity: null }, // if capacity is null
              { remainingCapacity: { gte: filter.slotRemainingCapacity } },
            ],
          },
        },
      });
    }

    return slotConditions.length ? [{ slots: { some: { AND: slotConditions } } }] : [];
  }
}
