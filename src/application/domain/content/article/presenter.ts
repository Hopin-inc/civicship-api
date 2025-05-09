import { GqlArticlesConnection, GqlArticle } from "@/types/graphql";
import { PrismaArticleDetail } from "@/application/domain/content/article/data/type";

export default class ArticlePresenter {
  static query(r: GqlArticle[], hasNextPage: boolean): GqlArticlesConnection {
    return {
      totalCount: r.length,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: true,
        startCursor: r[0]?.id,
        endCursor: r.length ? r[r.length - 1].id : undefined,
      },
      edges: r.map((edge) => ({
        cursor: edge.id,
        node: edge,
      })),
    };
  }

  static get(r: PrismaArticleDetail): GqlArticle {
    return r;
  }
}
