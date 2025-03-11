import {
  GqlArticlesConnection,
  GqlArticle,
  GqlArticleCreateSuccess,
  GqlArticleDeleteSuccess,
  GqlArticleUpdateSuccess,
} from "@/types/graphql";
import { ArticlePayloadWithArgs } from "@/application/article/infrastructure/type";

export default class ArticleOutputFormat {
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

  static get(r: ArticlePayloadWithArgs): GqlArticle {
    return r;
  }

  static create(r: ArticlePayloadWithArgs): GqlArticleCreateSuccess {
    return {
      __typename: "ArticleCreateSuccess",
      article: this.get(r),
    };
  }

  static delete(r: ArticlePayloadWithArgs): GqlArticleDeleteSuccess {
    return {
      __typename: "ArticleDeleteSuccess",
      id: r.id,
    };
  }

  static update(r: ArticlePayloadWithArgs): GqlArticleUpdateSuccess {
    return {
      __typename: "ArticleUpdateSuccess",
      article: this.get(r),
    };
  }
}
