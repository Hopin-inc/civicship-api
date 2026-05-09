import { GqlPortfolio, GqlPortfolioSource } from "@/types/graphql";
import PlacePresenter from "@/application/domain/location/place/presenter";
import UserPresenter from "@/application/domain/account/user/presenter";
import { EvaluationStatus, ParticipationStatusReason, VcIssuanceStatus } from "@prisma/client";
import { PrismaParticipationForPortfolioInclude } from "@/application/domain/experience/participation/data/type";
import { PrismaArticleForPortfolio } from "@/application/domain/content/article/data/type";

export default class ViewPresenter {
  static getFromParticipation(p: PrismaParticipationForPortfolioInclude): GqlPortfolio | null {
    if (isPersonalRecord(p)) {
      return buildFromPersonalRecord(p);
    }
    return buildFromReservation(p);
  }

  static getFromArticle(article: PrismaArticleForPortfolio): GqlPortfolio {
    const { relatedUsers, authors } = article;
    const participations = [...(authors ?? []), ...(relatedUsers ?? [])];

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
  }
}

function isPersonalRecord(p: PrismaParticipationForPortfolioInclude): boolean {
  return p.reason === ParticipationStatusReason.PERSONAL_RECORD;
}

function checkVCPassed(
  evaluation: PrismaParticipationForPortfolioInclude["evaluation"],
): evaluation is NonNullable<typeof evaluation> & {
  vcIssuanceRequest: { id: string; status: VcIssuanceStatus };
} {
  return (
    !!evaluation &&
    evaluation.status === EvaluationStatus.PASSED &&
    evaluation.vcIssuanceRequest?.status === VcIssuanceStatus.COMPLETED
  );
}

function buildFromPersonalRecord(p: PrismaParticipationForPortfolioInclude): GqlPortfolio | null {
  const opportunity = p.opportunitySlot?.opportunity;
  const startsAt = p.opportunitySlot?.startsAt;
  const place = opportunity?.place;
  const e = p.evaluation;

  if (!opportunity || !startsAt) return null;

  if (checkVCPassed(e)) {
    return {
      id: p.id,
      title: opportunity.title,
      source: GqlPortfolioSource.Opportunity,
      category: opportunity.category,
      reservationStatus: null,
      evaluationStatus: e.status,
      date: startsAt,
      place: place ? PlacePresenter.formatPortfolio(place) : null,
      thumbnailUrl: p.images?.[0]?.url ?? opportunity.images?.[0]?.url ?? null,
      participants:
        p.reservation?.participations
          ?.map((p) => p.user)
          .filter((user): user is NonNullable<typeof user> => !!user)
          .map((user) => UserPresenter.formatPortfolio(user)) ?? [],
    };
  }

  return {
    id: p.id,
    title: opportunity.title,
    source: GqlPortfolioSource.Opportunity,
    category: opportunity.category,
    reservationStatus: null,
    evaluationStatus: e?.status ?? null,
    date: startsAt,
    place: place ? PlacePresenter.formatPortfolio(place) : null,
    thumbnailUrl: p.images?.[0]?.url ?? opportunity.images?.[0]?.url ?? null,
    participants:
      p.reservation?.participations
        ?.map((p) => p.user)
        .filter((user): user is NonNullable<typeof user> => !!user)
        .map((user) => UserPresenter.formatPortfolio(user)) ?? [],
  };
}

function buildFromReservation(p: PrismaParticipationForPortfolioInclude): GqlPortfolio | null {
  const slot = p.reservation?.opportunitySlot;
  const opportunity = slot?.opportunity;
  const startsAt = slot?.startsAt;
  const place = opportunity?.place;
  const e = p.evaluation;

  if (!slot || !opportunity || !startsAt) return null;

  if (checkVCPassed(e)) {
    return {
      id: e.vcIssuanceRequest.id,
      title: opportunity.title,
      source: GqlPortfolioSource.Opportunity,
      category: opportunity.category,
      reservationStatus: p.reservation?.status ?? null,
      evaluationStatus: e.status,
      date: startsAt,
      place: place ? PlacePresenter.formatPortfolio(place) : null,
      thumbnailUrl: p.images?.[0]?.url ?? opportunity.images?.[0]?.url ?? null,
      participants:
        p.reservation?.participations
          ?.map((p) => p.user)
          .filter((user): user is NonNullable<typeof user> => !!user)
          .map((user) => UserPresenter.formatPortfolio(user)) ?? [],
    };
  }

  return {
    id: p.id,
    title: opportunity.title,
    source: GqlPortfolioSource.Opportunity,
    category: opportunity.category,
    reservationStatus: p.reservation?.status ?? null,
    evaluationStatus: e?.status ?? null,
    date: startsAt,
    place: place ? PlacePresenter.formatPortfolio(place) : null,
    thumbnailUrl: p.images?.[0]?.url ?? opportunity.images?.[0]?.url ?? null,
    participants:
      p.reservation?.participations
        ?.map((p) => p.user)
        .filter((user): user is NonNullable<typeof user> => !!user)
        .map((user) => UserPresenter.formatPortfolio(user)) ?? [],
  };
}
