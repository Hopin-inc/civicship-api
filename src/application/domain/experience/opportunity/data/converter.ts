import {
  GqlImageInput,
  GqlOpportunityCreateInput,
  GqlOpportunityFilterInput,
  GqlOpportunitySortInput,
  GqlOpportunityUpdateContentInput,
} from "@/types/graphql";
import { Prisma } from "@prisma/client";
import { injectable } from "tsyringe";

@injectable()
export default class OpportunityConverter {
  filter(filter?: GqlOpportunityFilterInput): Prisma.OpportunityWhereInput {
    if (!filter) return {};

    const conditions: Prisma.OpportunityWhereInput[] = [
      ...this.opportunityFilter(filter),
      ...this.opportunitySlotFilter(filter),
    ];

    if (Array.isArray(filter.and) && filter.and.length) {
      conditions.push({
        AND: filter.and.map((sub) => this.filter(sub)),
      });
    }

    if (Array.isArray(filter.or) && filter.or.length) {
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

  sort(sort?: GqlOpportunitySortInput): Prisma.OpportunityOrderByWithRelationInput[] {
    if (sort?.earliestSlotStartsAt) {
      return [
        {
          earliestReservableSlotView: {
            earliestReservableAt: sort.earliestSlotStartsAt,
          },
        },
        { createdAt: Prisma.SortOrder.desc },
      ];
    }

    return [{ createdAt: sort?.createdAt ?? Prisma.SortOrder.desc }];
  }

  findAccessible(
    id: string,
    filter?: GqlOpportunityFilterInput,
  ): Prisma.OpportunityWhereUniqueInput & Prisma.OpportunityWhereInput {
    const validatedFilter = this.filter(filter);
    return {
      id,
      ...(validatedFilter.AND ? { AND: validatedFilter.AND } : {}),
    };
  }

  create(
    input: GqlOpportunityCreateInput,
    currentUserId: string,
  ): {
    data: Omit<Prisma.OpportunityCreateInput, "images">;
    images: GqlImageInput[];
  } {
    const { images, place, communityId, ...prop } = input;

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
      data: {
        ...prop,
        community: { connect: { id: communityId } },
        createdByUser: { connect: { id: currentUserId } },
        ...(finalPlace ? { place: finalPlace } : {}),
      },
      images: images ?? [],
    };
  }

  update(input: GqlOpportunityUpdateContentInput): {
    data: Omit<Prisma.OpportunityUpdateInput, "images">;
    images: GqlImageInput[];
  } {
    const { place, images, ...prop } = input;

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
      data: {
        ...prop,
        ...(finalPlace ? { place: finalPlace } : {}),
      },
      images: images ?? [],
    };
  }

  private opportunityFilter(filter: GqlOpportunityFilterInput): Prisma.OpportunityWhereInput[] {
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
    if (filter.stateCodes?.length)
      conditions.push({ place: { city: { state: { code: { in: filter.cityCodes } } } } });
    if (filter.articleIds?.length)
      conditions.push({ articles: { some: { id: { in: filter.articleIds } } } });
    if (filter.requiredUtilityIds?.length)
      conditions.push({ requiredUtilities: { some: { id: { in: filter.requiredUtilityIds } } } });

    return conditions;
  }

  private opportunitySlotFilter(filter: GqlOpportunityFilterInput): Prisma.OpportunityWhereInput[] {
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
