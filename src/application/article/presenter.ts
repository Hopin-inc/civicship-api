import {
  GqlArticlesConnection,
  GqlArticle,
  GqlArticleCreateSuccess,
  GqlArticleDeleteSuccess,
  GqlArticleUpdateSuccess,
} from "@/types/graphql";
import { PrismaArticle } from "@/application/article/data/type";
import CommunityPresenter from "@/application/community/presenter";
import UserPresenter from "@/application/user/presenter";
import OpportunityPresenter from "@/application/opportunity/presenter";

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

  static get(r: PrismaArticle): GqlArticle {
    const { community, opportunities, authors, relatedUsers, ...prop } = r;

    return {
      ...prop,
      community: CommunityPresenter.get(community),
      authors: authors.map(UserPresenter.get),
      relatedUsers: relatedUsers.map(UserPresenter.get),
      opportunities: opportunities.map(OpportunityPresenter.get),
    };
  }

  static create(r: PrismaArticle): GqlArticleCreateSuccess {
    return {
      __typename: "ArticleCreateSuccess",
      article: this.get(r),
    };
  }

  static delete(r: PrismaArticle): GqlArticleDeleteSuccess {
    return {
      __typename: "ArticleDeleteSuccess",
      articleId: r.id,
    };
  }

  static update(r: PrismaArticle): GqlArticleUpdateSuccess {
    return {
      __typename: "ArticleUpdateSuccess",
      article: this.get(r),
    };
  }
}
