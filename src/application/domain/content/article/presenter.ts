import { GqlArticlesConnection, GqlArticle } from "@/types/graphql";
import { PrismaArticle } from "@/application/domain/content/article/data/type";
import UserPresenter from "@/application/domain/account/user/presenter";
import OpportunityPresenter from "@/application/domain/experience/opportunity/presenter";
import CommunityPresenter from "@/application/domain/account/community/presenter";

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
}
