import { 
  GqlArticlesConnection, 
  GqlArticle,
  GqlArticleCreatePayload,
  GqlArticleUpdateContentPayload,
  GqlArticleDeletePayload
} from "@/types/graphql";
import { PrismaArticleDetail } from "@/application/domain/content/article/data/type";

export default class ArticlePresenter {
  static query(r: GqlArticle[], hasNextPage: boolean, cursor?: string): GqlArticlesConnection {
    return {
      __typename: "ArticlesConnection",
      totalCount: r.length,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: !!cursor,
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
    return {
      __typename: "Article",
      ...r,
    };
  }

  static create(record: PrismaArticleDetail): GqlArticleCreatePayload {
    return {
      __typename: "ArticleCreateSuccess",
      article: this.get(record),
    };
  }

  static update(record: PrismaArticleDetail): GqlArticleUpdateContentPayload {
    return {
      __typename: "ArticleUpdateContentSuccess", 
      article: this.get(record),
    };
  }

  static delete(record: PrismaArticleDetail): GqlArticleDeletePayload {
    return {
      __typename: "ArticleDeleteSuccess",
      articleId: record.id,
    };
  }
}
