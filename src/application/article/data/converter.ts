import { GqlArticleFilterInput, GqlArticleSortInput } from "@/types/graphql";
import { Prisma } from "@prisma/client";

export default class ArticleConverter {
  static filter(filter?: GqlArticleFilterInput): Prisma.ArticleWhereInput {
    return {
      AND: [
        filter?.keyword ? { title: { contains: filter.keyword } } : {},
        filter?.category ? { category: filter.category } : {},
        filter?.publishStatus && filter.publishStatus.length
          ? { publishStatus: { in: filter.publishStatus } }
          : {},
        filter?.authors && filter.authors.length
          ? { authors: { some: { id: { in: filter.authors } } } }
          : {},
        filter?.relatedUserIds && filter.relatedUserIds.length
          ? { relatedUsers: { some: { id: { in: filter.relatedUserIds } } } }
          : {},
        filter?.communityId ? { communityId: filter.communityId } : {},
      ],
    };
  }

  static sort(sort?: GqlArticleSortInput): Prisma.ArticleOrderByWithRelationInput[] {
    const orderBy = [
      ...(sort?.publishedAt !== undefined ? [{ publishedAt: sort.publishedAt }] : []),
      ...(sort?.createdAt !== undefined ? [{ createdAt: sort.createdAt }] : []),
    ];
    return orderBy.length ? orderBy : [{ createdAt: Prisma.SortOrder.desc }];
  }
}
