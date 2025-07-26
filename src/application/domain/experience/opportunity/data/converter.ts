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

    // 検索キーワードがない場合のみ予約締め切りフィルターを適用
    // これにより通常の一覧表示では予約締め切りが過ぎたアクティビティは表示されないが
    // 検索時には予約締め切りに関わらず表示される
    if (!filter.keyword) {
      conditions.push(...this.reservationDeadlineFilter());
    }

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

  private opportunityFilter(filter: GqlOpportunityFilterInput): Prisma.OpportunityWhereInput[] {
    const conditions: Prisma.OpportunityWhereInput[] = [];

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

  /**
   * 予約締め切りが過ぎたアクティビティを除外するフィルター
   * 各アクティビティの予約締め切り日数を考慮して、予約可能なスロットを持つアクティビティのみを表示
   * ただし、スロットがないアクティビティは常に表示する（外部予約を想定）
   */
  private reservationDeadlineFilter(): Prisma.OpportunityWhereInput[] {
    const now = new Date();

    return [{
      OR: [
        // スロットがないアクティビティは表示する
        {
          slots: {
            none: {}
          }
        },
        // 予約可能なスロットがあるアクティビティを表示
        {
          slots: {
            some: {
              AND: [
                { hostingStatus: "SCHEDULED" },
                {
                  startsAt: {
                    // 現在時刻より後のスロットのみ
                    gt: now,
                  },
                },
                {
                  // カスタム条件: スロットの開始時間が (現在時刻 + 予約締め切り日数) より後
                  OR: [
                    // 予約締め切り日数が0の場合は、開始時間が現在時刻より後ならOK
                    {
                      opportunity: {
                        id: {
                          in: this.getZeroAdvanceBookingOpportunityIds(),
                        },
                      },
                      startsAt: { gt: now },
                    },
                    // 予約締め切り日数が設定されている場合は、その日数を考慮
                    {
                      opportunity: {
                        id: {
                          notIn: this.getZeroAdvanceBookingOpportunityIds(),
                        },
                      },
                      // 各アクティビティの予約締め切り日数はクエリ内で直接計算できないため、
                      // 最大の予約締め切り日数（例: 7日）を使用
                      startsAt: {
                        gt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
                      },
                    },
                  ],
                },
              ],
            },
          },
        },
      ],
    }];
  }

  /**
   * 予約締め切り日数が0のアクティビティIDを取得
   * 実際の環境では環境変数から取得するが、ここではハードコードした例
   */
  private getZeroAdvanceBookingOpportunityIds(): string[] {
    try {
      const envConfig = process.env.ACTIVITY_ADVANCE_BOOKING_DAYS_CONFIG;
      if (!envConfig) return [];

      const config = JSON.parse(envConfig);
      return Object.entries(config)
        .filter(([_, days]) => days === 0)
        .map(([id]) => id);
    } catch (error) {
      console.error('Error parsing ACTIVITY_ADVANCE_BOOKING_DAYS_CONFIG', error);
      return [];
    }
  }
}
