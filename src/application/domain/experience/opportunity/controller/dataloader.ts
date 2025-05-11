import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { GqlOpportunity } from "@/types/graphql";
import {
  opportunitySelectDetail,
  PrismaOpportunityDetail,
} from "@/application/domain/experience/opportunity/data/type";
import OpportunityPresenter from "@/application/domain/experience/opportunity/presenter";
import {
  createHasManyLoaderByKey,
  createLoaderById,
} from "@/presentation/graphql/dataloader/utils";

export function createOpportunityLoader(issuer: PrismaClientIssuer) {
  return createLoaderById<PrismaOpportunityDetail, GqlOpportunity>(
    async (ids) =>
      issuer.internal((tx) =>
        tx.opportunity.findMany({
          where: { id: { in: [...ids] } },
          select: opportunitySelectDetail,
        }),
      ),
    OpportunityPresenter.get,
  );
}

export function createOpportunitiesByArticleLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlOpportunity[]>(async (articleIds) => {
    const articles = await issuer.internal((tx) =>
      tx.article.findMany({
        where: { id: { in: [...articleIds] } },
        include: { opportunities: true },
      }),
    );

    const map = new Map<string, GqlOpportunity[]>();
    for (const article of articles) {
      map.set(article.id, article.opportunities.map(OpportunityPresenter.get));
    }

    return articleIds.map((id) => map.get(id) ?? []);
  });
}

export function createOpportunitiesByUtilityLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlOpportunity[]>(async (utilityIds) => {
    const utilities = await issuer.internal((tx) =>
      tx.utility.findMany({
        where: { id: { in: [...utilityIds] } },
        include: { requiredForOpportunities: true },
      }),
    );

    const map = new Map<string, GqlOpportunity[]>();
    for (const utility of utilities) {
      map.set(utility.id, utility.requiredForOpportunities.map(OpportunityPresenter.get));
    }

    return utilityIds.map((id) => map.get(id) ?? []);
  });
}

export function createOpportunitiesCreatedByUserLoader(issuer: PrismaClientIssuer) {
  return createHasManyLoaderByKey<"createdBy", PrismaOpportunityDetail, GqlOpportunity>(
    "createdBy",
    async (userIds) => {
      return issuer.internal((tx) =>
        tx.opportunity.findMany({
          where: {
            createdBy: { in: [...userIds] },
          },
        }),
      );
    },
    OpportunityPresenter.get,
  );
}

export function createOpportunitiesByCommunityLoader(issuer: PrismaClientIssuer) {
  return createHasManyLoaderByKey<"communityId", PrismaOpportunityDetail, GqlOpportunity>(
    "communityId",
    async (communityIds) => {
      return issuer.internal((tx) =>
        tx.opportunity.findMany({
          where: { communityId: { in: [...communityIds] } },
        }),
      );
    },
    OpportunityPresenter.get,
  );
}

export function createOpportunitiesByPlaceLoader(issuer: PrismaClientIssuer) {
  return createHasManyLoaderByKey<"placeId", PrismaOpportunityDetail, GqlOpportunity>(
    "placeId",
    async (placeIds) => {
      return issuer.internal((tx) =>
        tx.opportunity.findMany({
          where: { placeId: { in: [...placeIds] } },
        }),
      );
    },
    OpportunityPresenter.get,
  );
}
