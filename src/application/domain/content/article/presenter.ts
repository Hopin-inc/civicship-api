import { GqlArticlesConnection, GqlArticle } from "@/types/graphql";
import { PrismaArticle, PrismaArticleDetail, PrismaArticleForPortfolioDetail } from "@/application/domain/content/article/data/type";

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

  static get(r: PrismaArticle | PrismaArticleDetail | PrismaArticleForPortfolioDetail): GqlArticle {
    return {
      ...r,
      thumbnail: r.thumbnail?.url,
      community: null,
      authors: [],
      relatedUsers: [],
      opportunities: [],
    };
  }
}
