import {
  GqlPortfolioFilterInput,
  GqlPortfolioSortInput,
  GqlDateTimeRangeFilter,
  GqlSortDirection,
} from "@/types/graphql";
import { Prisma } from "@prisma/client";
import { injectable } from "tsyringe";

@injectable()
export default class ViewConverter {
  filterParticipation(
    userId: string,
    communityId: string,
    filter?: GqlPortfolioFilterInput,
  ): Prisma.ParticipationWhereInput {
    // MEMO: participationsにcommunityIdが紐付いていない
    const conditions: Prisma.ParticipationWhereInput[] = [
      {
        userId,
        OR: [
          { communityId },
          { opportunitySlot: { opportunity: { community: { id: communityId } } } },
          { reservation: { opportunitySlot: { opportunity: { community: { id: communityId } } } } },
        ],
      },
    ];

    // MEMO: 複数コミュニティ跨る際に復旧
    // if (Array.isArray(filter?.communityIds) && filter.communityIds.length > 0) {
    //   conditions.push({ communityId: { in: filter.communityIds } });
    // }

    if (filter?.dateRange) {
      conditions.push(this.dateRangeConditionForParticipation(filter.dateRange));
    }

    if (filter?.keyword) {
      conditions.push({
        OR: [
          {
            opportunitySlot: {
              opportunity: { title: { contains: filter.keyword, mode: "insensitive" } },
            },
          },
          {
            reservation: {
              opportunitySlot: {
                opportunity: { title: { contains: filter.keyword, mode: "insensitive" } },
              },
            },
          },
        ],
      });
    }

    return { AND: conditions };
  }

  filterArticle(
    userId: string,
    communityId: string,
    filter?: GqlPortfolioFilterInput,
  ): Prisma.ArticleWhereInput {
    const conditions: Prisma.ArticleWhereInput[] = [
      {
        OR: [{ relatedUsers: { some: { id: userId } } }, { authors: { some: { id: userId } } }],
      },
      { communityId },
    ];

    // MEMO: 複数コミュニティ跨る際に復旧
    // if (Array.isArray(filter?.communityIds) && filter.communityIds.length > 0) {
    //   conditions.push({ communityId: { in: filter.communityIds } });
    // }

    if (filter?.dateRange) {
      conditions.push(this.dateRangeConditionForArticle(filter.dateRange));
    }

    if (filter?.keyword) {
      conditions.push({ title: { contains: filter.keyword, mode: "insensitive" } });
    }

    return { AND: conditions };
  }

  sort(sort?: GqlPortfolioSortInput): Prisma.SortOrder {
    switch (sort?.date) {
      case GqlSortDirection.Asc:
        return "asc";
      case GqlSortDirection.Desc:
        return "desc";
      default:
        return "desc";
    }
  }

  private dateRangeConditionForParticipation(
    range: GqlDateTimeRangeFilter,
  ): Prisma.ParticipationWhereInput {
    const condition: Prisma.OpportunitySlotWhereInput["startsAt"] = {};

    if (range.gte) condition.gte = range.gte;
    if (range.gt) condition.gt = range.gt;
    if (range.lte) condition.lte = range.lte;
    if (range.lt) condition.lt = range.lt;

    return {
      OR: [
        { opportunitySlot: { startsAt: condition } },
        { reservation: { opportunitySlot: { startsAt: condition } } },
      ],
    };
  }

  private dateRangeConditionForArticle(range: GqlDateTimeRangeFilter): Prisma.ArticleWhereInput {
    const condition: Prisma.ArticleWhereInput["publishedAt"] = {};

    if (range.gte) condition.gte = range.gte;
    if (range.gt) condition.gt = range.gt;
    if (range.lte) condition.lte = range.lte;
    if (range.lt) condition.lt = range.lt;

    return {
      publishedAt: condition,
    };
  }
}
