import { GqlArticleCategory, GqlArticleFilterInput, GqlArticleSortInput } from "@/types/graphql";
import { Prisma } from "@prisma/client";
import { injectable } from "tsyringe";

@injectable()
export default class ArticleConverter {
  filter(filter?: GqlArticleFilterInput): Prisma.ArticleWhereInput {
    if (!filter) return {};

    const conditions: Prisma.ArticleWhereInput[] = [];

    if (filter.keyword) {
      conditions.push({
        OR: [
          { title: { contains: filter.keyword } },
          { introduction: { contains: filter.keyword } },
          { body: { contains: filter.keyword } },
        ],
      });
    }
    if (filter.categories?.length) {
      const validCategories = filter.categories.filter(isArticleCategory);
      if (validCategories.length) {
        conditions.push({ category: { in: validCategories } });
      }
    }
    if (filter.publishStatus?.length)
      conditions.push({ publishStatus: { in: filter.publishStatus } });

    if (filter.authors?.length)
      conditions.push({ authors: { some: { id: { in: filter.authors } } } });
    if (filter.relatedUserIds?.length)
      conditions.push({ relatedUsers: { some: { id: { in: filter.relatedUserIds } } } });

    if (filter.dateFrom || filter.dateTo) {
      conditions.push({
        publishedAt: {
          ...(filter.dateFrom ? { gte: filter.dateFrom } : {}),
          ...(filter.dateTo ? { lte: filter.dateTo } : {}),
        },
      });
    }

    if (filter.communityId) conditions.push({ communityId: filter.communityId });

    if (filter.cityCodes?.length) {
      conditions.push({
        community: {
          places: {
            some: {
              city: {
                state: {
                  code: { in: filter.stateCodes },
                },
              },
            },
          },
        },
      });
    }
    if (filter.stateCodes?.length) {
      conditions.push({
        community: {
          places: {
            some: {
              city: {
                state: {
                  code: { in: filter.stateCodes },
                },
              },
            },
          },
        },
      });
    }

    if (Array.isArray(filter.and) && filter.and.length)
      conditions.push({ AND: filter.and.map((f) => this.filter(f)) });
    if (Array.isArray(filter.or) && filter.or.length)
      conditions.push({ OR: filter.or.map((f) => this.filter(f)) });
    if (filter.not) conditions.push({ NOT: this.filter(filter.not) });

    return conditions.length ? { AND: conditions } : {};
  }

  sort(sort?: GqlArticleSortInput): Prisma.ArticleOrderByWithRelationInput[] {
    const orderBy = [
      ...(sort?.publishedAt !== undefined ? [{ publishedAt: sort.publishedAt }] : []),
      ...(sort?.createdAt !== undefined ? [{ createdAt: sort.createdAt }] : []),
    ];
    return orderBy.length ? orderBy : [{ createdAt: Prisma.SortOrder.desc }];
  }

  findAccessible(
    id: string,
    filter?: GqlArticleFilterInput,
  ): Prisma.ArticleWhereUniqueInput & Prisma.ArticleWhereInput {
    const safeFilter = this.filter(filter);
    return {
      id,
      ...(safeFilter.AND ? { AND: safeFilter.AND } : {}),
    };
  }
}

function isArticleCategory(value: unknown): value is GqlArticleCategory {
  return typeof value === "string" && (value === "ACTIVITY_REPORT" || value === "INTERVIEW");
}
