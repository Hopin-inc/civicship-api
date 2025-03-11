import {
  GqlArticleFilterInput,
  GqlArticleSortInput,
  GqlArticleCreateInput,
  GqlArticleUpdateInput,
} from "@/types/graphql";
import { Prisma } from "@prisma/client";

export default class ArticleConverter {
  static filter(filter?: GqlArticleFilterInput): Prisma.ArticleWhereInput {
    return {
      AND: [
        filter?.keyword ? { title: { contains: filter.keyword } } : {},
        filter?.category ? { category: filter.category } : {},
        filter?.publishStatus ? { publishStatus: filter.publishStatus } : {},
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

  static create(input: GqlArticleCreateInput): Prisma.ArticleCreateInput {
    const { authorIds, relatedUserIds, communityId, opportunityIds, publishedAt, ...rest } = input;

    return {
      ...rest,
      publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
      authors: authorIds?.length ? { connect: authorIds.map((id) => ({ id })) } : undefined,
      relatedUsers: relatedUserIds?.length
        ? { connect: relatedUserIds.map((id) => ({ id })) }
        : undefined,
      community: { connect: { id: communityId } },
      opportunities: opportunityIds?.length
        ? { connect: opportunityIds.map((id) => ({ id })) }
        : undefined,
    };
  }

  static update(input: GqlArticleUpdateInput): Prisma.ArticleUpdateInput {
    const { authorIds, relatedUserIds, communityId, opportunityIds, publishedAt, ...rest } = input;

    return {
      ...rest,
      publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
      authors: authorIds?.length ? { set: authorIds.map((id) => ({ id })) } : undefined,
      relatedUsers: relatedUserIds?.length
        ? { set: relatedUserIds.map((id) => ({ id })) }
        : undefined,
      community: { connect: { id: communityId } },
      opportunities: opportunityIds?.length
        ? { set: opportunityIds.map((id) => ({ id })) }
        : undefined,
    };
  }
}
