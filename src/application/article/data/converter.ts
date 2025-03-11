import {
  GqlArticleFilterInput,
  GqlArticleSortInput,
  GqlArticleCreateInput,
  GqlArticleUpdateInput,
} from "@/types/graphql";
import { Prisma } from "@prisma/client";

export default class ArticleInputFormat {
  static filter(filter?: GqlArticleFilterInput): Prisma.ArticleWhereInput {
    return {
      AND: [
        filter?.keyword ? { title: { contains: filter.keyword } } : {},
        filter?.category ? { category: filter.category } : {},
        filter?.publishStatus ? { publishStatus: filter.publishStatus } : {},
      ],
    };
  }

  static sort(sort?: GqlArticleSortInput): Prisma.ArticleOrderByWithRelationInput[] {
    return [{ createdAt: sort?.createdAt ?? Prisma.SortOrder.desc }];
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
