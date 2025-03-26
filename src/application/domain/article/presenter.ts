import { GqlArticlesConnection, GqlArticle } from "@/types/graphql";
import { PrismaArticle } from "@/application/domain/article/data/type";
import UserPresenter from "@/application/domain/user/presenter";
import OpportunityPresenter from "@/application/domain/opportunity/presenter";

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
      community,
      authors: authors.map(UserPresenter.get),
      relatedUsers: relatedUsers.map(UserPresenter.get),
      opportunities: opportunities.map(OpportunityPresenter.get),
    };
  }
}
