import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { GqlOpportunity } from "@/types/graphql";
import {
  opportunitySelectDetail,
  PrismaOpportunityDetail,
} from "@/application/domain/experience/opportunity/data/type";
import OpportunityPresenter from "@/application/domain/experience/opportunity/presenter";
import { createHasManyLoaderByKey } from "@/presentation/graphql/dataloader/utils";

async function batchOpportunitiesById(
  issuer: PrismaClientIssuer,
  opportunityIds: readonly string[],
): Promise<(GqlOpportunity | null)[]> {
  const records = await issuer.internal(async (tx) => {
    return tx.opportunity.findMany({
      where: { id: { in: [...opportunityIds] } },
      select: opportunitySelectDetail,
    });
  });

  const oppMap = new Map(
    records.map((record) => [record.id, OpportunityPresenter.get(record)]),
  ) as Map<string, GqlOpportunity | null>;

  return opportunityIds.map((id) => oppMap.get(id) ?? null);
}

export function createOpportunityLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlOpportunity | null>((keys) =>
    batchOpportunitiesById(issuer, keys),
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
