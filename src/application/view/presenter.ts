import { GqlPortfolio, GqlPortfolioSource } from "@/types/graphql";
import PlacePresenter from "@/application/domain/location/place/presenter";
import UserPresenter from "@/application/domain/account/user/presenter";
import {
  PrismaUserArticlePortfolio,
  PrismaUserParticipationPortfolio,
} from "@/application/domain/account/user/data/type";

export default class ViewPresenter {
  static getFromParticipations(user: PrismaUserParticipationPortfolio): GqlPortfolio[] {
    return (user.participations ?? [])
      .map((p) => ViewPresenter.getFromParticipation(p))
      .filter((portfolio): portfolio is GqlPortfolio => portfolio !== null);
  }

  static getFromParticipation(
    p: PrismaUserParticipationPortfolio["participations"][number],
  ): GqlPortfolio | null {
    const { reservation, images } = p;

    if (!reservation || !reservation.opportunitySlot) {
      return null;
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
      place: place ? PlacePresenter.formatPortfolio(place) : null,
      thumbnailUrl: images?.[0]?.url ?? opportunity.images?.[0]?.url ?? null,
      participants: reservation?.participations
        ? reservation.participations
            .map((p) => p.user)
            .filter((user): user is NonNullable<typeof user> => user !== null)
            .map((user) => UserPresenter.formatPortfolio(user))
        : [],
    };
  }

  static getFromArticles(user: PrismaUserArticlePortfolio): GqlPortfolio[] {
    const { articlesAboutMe, articlesWrittenByMe } = user;

    const allArticles = [...(articlesAboutMe ?? []), ...(articlesWrittenByMe ?? [])];

    return allArticles.map((article): GqlPortfolio => {
      const { relatedUsers, authors } = article;
      const participations = [...(authors ?? []), ...(relatedUsers ?? [])];
      console.log(article.id, participations);
      console.log(article);
      const thumbnailUrl = article.thumbnail?.url ?? null;

      return {
        id: article.id,
        title: article.title,
        source: GqlPortfolioSource.Article,
        category: article.category,
        date: article.publishedAt,
        thumbnailUrl,
        participants: participations
          .filter((user): user is NonNullable<typeof user> => user !== null)
          .map((user) => UserPresenter.formatPortfolio(user)),
      };
    });
  }
}
