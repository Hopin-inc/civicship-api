import { GqlPortfolio, GqlPortfoliosConnection, GqlPortfolioSource } from "@/types/graphql";
import PlacePresenter from "@/application/domain/place/presenter";
import UserPresenter from "@/application/domain/user/presenter";
import { ValidParticipationForPortfolio } from "@/application/view/service";
import { PrismaArticleForPortfolio } from "@/application/domain/article/data/type";

export default class ViewPresenter {
  static query(r: GqlPortfolio[], hasNextPage: boolean): GqlPortfoliosConnection {
    return {
      totalCount: r.length,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: true,
        startCursor: r[0]?.id,
        endCursor: r.at(-1)?.id,
      },
      edges: r.map((node) => ({
        cursor: node.id,
        node,
      })),
    };
  }

  static getFromParticipation(p: ValidParticipationForPortfolio): GqlPortfolio {
    const { reservation, images } = p;

    if (!reservation) {
      throw new Error('Reservation is required for portfolio');
    }

    const { opportunity, startsAt } = reservation.opportunitySlot;
    const place = opportunity.place;

    return {
      id: p.id,
      title: opportunity.title,
      source: GqlPortfolioSource.Opportunity,
      category: opportunity.category,
      reservationStatus: reservation?.status,
      date: startsAt,
      place: place ? PlacePresenter.get(place) : null,
      thumbnailUrl: images?.[0]?.url ?? opportunity.images[0].url,
      participants: reservation?.participations
        ? reservation.participations
          .map((p) => p.user)
          .filter((user): user is NonNullable<typeof user> => user !== null)
          .map((user) => UserPresenter.get(user))
        : [],
    };
  }

  static getFromArticle(article: PrismaArticleForPortfolio): GqlPortfolio {
    const { relatedUsers, authors } = article;
    const participations = [...(authors ?? []), ...(relatedUsers ?? [])];

    const thumbnailUrl = article.thumbnail
      ? Array.isArray(article.thumbnail) && article.thumbnail.length > 0 && article.thumbnail[0].url
        ? article.thumbnail[0].url
        : null
      : null;

    return {
      id: article.id,
      title: article.title,
      source: GqlPortfolioSource.Article,
      category: article.category,
      date: article.publishedAt,
      thumbnailUrl,
      participants: participations
        ? participations
          .filter((user): user is NonNullable<typeof user> => user !== null)
          .map((user) => UserPresenter.get(user))
        : [],
    };
  }
}
