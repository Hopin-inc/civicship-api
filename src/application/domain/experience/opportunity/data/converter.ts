import {
  GqlImageInput,
  GqlOpportunityCreateInput,
  GqlOpportunityFilterInput,
  GqlOpportunitySortInput,
  GqlOpportunityUpdateContentInput,
} from "@/types/graphql";
import { Prisma } from "@prisma/client";
import { injectable } from "tsyringe";
import { IContext } from "@/types/server";

@injectable()
export default class OpportunityConverter {
  filter(ctx: IContext, filter?: GqlOpportunityFilterInput): Prisma.OpportunityWhereInput {
    if (!filter) return {};

    const conditions: Prisma.OpportunityWhereInput[] = [
      ...this.opportunityFilter(filter, ctx.communityId),
      ...this.opportunitySlotFilter(filter),
    ];

    if (Array.isArray(filter.and) && filter.and.length) {
      conditions.push({
        AND: filter.and.map((sub) => this.filter(ctx, sub)),
      });
    }

    if (Array.isArray(filter.or) && filter.or.length) {
      conditions.push({
        OR: filter.or.map((sub) => this.filter(ctx, sub)),
      });
    }

    if (filter.not) {
      conditions.push({
        NOT: this.filter(ctx, filter.not),
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
    ctx: IContext,
    id: string,
    filter?: GqlOpportunityFilterInput,
  ): Prisma.OpportunityWhereUniqueInput & Prisma.OpportunityWhereInput {
    const validatedFilter = this.filter(ctx, filter);
    return {
      id,
      ...(validatedFilter.AND ? { AND: validatedFilter.AND } : {}),
    };
  }

  create = (
    input: GqlOpportunityCreateInput,
    communityId: string,
    userId: string,
  ): {
    data: Omit<Prisma.OpportunityCreateInput, "images">;
    images: GqlImageInput[];
  } => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { images, placeId, slots, createdBy, requiredUtilityIds, relatedArticleIds, ...rest } =
      input;

    return {
      data: {
        ...rest,
        community: { connect: { id: communityId } },
        createdByUser: { connect: { id: userId } },
        ...(placeId && {
          place: { connect: { id: placeId } },
        }),
        ...(slots?.length && {
          slots: { create: slots },
        }),
        ...(requiredUtilityIds?.length && {
          requiredUtilities: {
            connect: requiredUtilityIds.filter(Boolean).map((id) => ({ id })),
          },
        }),
        ...(relatedArticleIds?.length && {
          articles: {
            connect: relatedArticleIds.filter(Boolean).map((id) => ({ id })),
          },
        }),
      },
      images: images ?? [],
    };
  };

  update(input: GqlOpportunityUpdateContentInput): {
    data: Omit<Prisma.OpportunityUpdateInput, "images">;
    images: GqlImageInput[];
  } {
    const { images, placeId, requiredUtilityIds, relatedArticleIds, ...prop } = input;

    return {
      data: {
        ...prop,
        ...(placeId?.trim() && {
          place: { connect: { id: placeId } },
        }),
        ...(requiredUtilityIds && {
          requiredUtilities: {
            set: requiredUtilityIds
              .filter((id): id is string => !!id?.trim())
              .map((id) => ({ id })),
          },
        }),
        ...(relatedArticleIds && {
          articles: {
            set: relatedArticleIds.filter((id): id is string => !!id?.trim()).map((id) => ({ id })),
          },
        }),
      },
      images: images ?? [],
    };
  }

  private opportunityFilter(
    filter: GqlOpportunityFilterInput,
    communityId: string,
  ): Prisma.OpportunityWhereInput[] {
    const conditions: Prisma.OpportunityWhereInput[] = [{ communityId }];

    if (filter.keyword) {
      conditions.push({
        OR: [
          { title: { contains: filter.keyword, mode: "insensitive" } },
          {
            place: {
              OR: [
                { name: { contains: filter.keyword, mode: "insensitive" } },
                {
                  city: {
                    OR: [
                      { name: { contains: filter.keyword, mode: "insensitive" } },
                      { state: { name: { contains: filter.keyword, mode: "insensitive" } } },
                    ],
                  },
                },
              ],
            },
          },
          { createdByUser: { name: { contains: filter.keyword, mode: "insensitive" } } },
        ],
      });
    }
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
      conditions.push({ place: { city: { state: { code: { in: filter.stateCodes } } } } });
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

    const range = filter.slotDateRange;
    if (range) {
      const startsAtCondition: Record<string, Date> = {};

      if (range.gte) {
        startsAtCondition.gte = range.gte;
      }
      if (range.lte) {
        startsAtCondition.lte = range.lte;
      }
      if (range.gt) {
        startsAtCondition.gt = range.gt;
      }
      if (range.lt) {
        startsAtCondition.lt = range.lt;
      }

      if (Object.keys(startsAtCondition).length > 0) {
        slotConditions.push({ startsAt: startsAtCondition });
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
