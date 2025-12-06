import DataLoader from "dataloader";
import { PrismaClient } from "@prisma/client";
import { GqlOpportunity } from "@/types/graphql";
import {
  opportunitySelectDetail,
  PrismaOpportunityDetail,
} from "@/application/domain/experience/opportunity/data/type";
import OpportunityPresenter from "@/application/domain/experience/opportunity/presenter";
import {
  createHasManyLoaderByKey,
  createLoaderByCompositeKey,
  createLoaderById,
} from "@/presentation/graphql/dataloader/utils";

export function createOpportunityLoader(prisma: PrismaClient) {
  return createLoaderById<PrismaOpportunityDetail, GqlOpportunity>(
    async (ids) =>
      prisma.opportunity.findMany({
        where: { id: { in: [...ids] } },
        select: opportunitySelectDetail,
      }),
    OpportunityPresenter.get,
  );
}

export function createOpportunitiesByArticleLoader(prisma: PrismaClient) {
  return new DataLoader<string, GqlOpportunity[]>(async (articleIds) => {
    const articles = await prisma.article.findMany({
      where: { id: { in: [...articleIds] } },
      include: { opportunities: true },
    });

    const map = new Map<string, GqlOpportunity[]>();
    for (const article of articles) {
      map.set(article.id, article.opportunities.map(OpportunityPresenter.get));
    }

    return articleIds.map((id) => map.get(id) ?? []);
  });
}

export function createOpportunitiesByUtilityLoader(prisma: PrismaClient) {
  return new DataLoader<string, GqlOpportunity[]>(async (utilityIds) => {
    const utilities = await prisma.utility.findMany({
      where: { id: { in: [...utilityIds] } },
      include: { requiredForOpportunities: true },
    });

    const map = new Map<string, GqlOpportunity[]>();
    for (const utility of utilities) {
      map.set(utility.id, utility.requiredForOpportunities.map(OpportunityPresenter.get));
    }

    return utilityIds.map((id) => map.get(id) ?? []);
  });
}

export function createOpportunitiesCreatedByUserLoader(prisma: PrismaClient) {
  return createHasManyLoaderByKey<"createdBy", PrismaOpportunityDetail, GqlOpportunity>(
    "createdBy",
    async (userIds) => {
      return prisma.opportunity.findMany({
        where: {
          createdBy: { in: [...userIds] },
        },
      });
    },
    OpportunityPresenter.get,
  );
}

export function createOpportunitiesByCommunityLoader(prisma: PrismaClient) {
  return createHasManyLoaderByKey<"communityId", PrismaOpportunityDetail, GqlOpportunity>(
    "communityId",
    async (communityIds) => {
      return prisma.opportunity.findMany({
        where: { communityId: { in: [...communityIds] } },
      });
    },
    OpportunityPresenter.get,
  );
}

export function createOpportunitiesByPlaceLoader(prisma: PrismaClient) {
  return createHasManyLoaderByKey<"placeId", PrismaOpportunityDetail, GqlOpportunity>(
    "placeId",
    async (placeIds) => {
      return prisma.opportunity.findMany({
        where: { placeId: { in: [...placeIds] } },
      });
    },
    OpportunityPresenter.get,
  );
}

type IsReservableKey = {
  opportunityId: string;
  userId: string;
  communityId: string;
};

type IsReservableRecord = {
  opportunityId: string;
  userId: string;
  communityId: string;
};

export function createIsReservableWithTicketLoader(prisma: PrismaClient) {
  return createLoaderByCompositeKey<IsReservableKey, IsReservableRecord, boolean>(
    async (keys) => {
      const results: IsReservableRecord[] = [];

      const userIds = [...new Set(keys.map((k) => k.userId))];
      const communityIds = [...new Set(keys.map((k) => k.communityId))];
      const opportunityIds = [...new Set(keys.map((k) => k.opportunityId))];

      const tickets = await prisma.ticket.findMany({
        where: {
          status: "AVAILABLE",
          wallet: {
            userId: { in: userIds },
            communityId: { in: communityIds },
          },
          utility: {
            requiredForOpportunities: {
              some: {
                id: { in: opportunityIds },
              },
            },
          },
        },
        select: {
          wallet: { select: { userId: true, communityId: true } },
          utility: {
            select: {
              requiredForOpportunities: { select: { id: true } },
            },
          },
        },
      });

      for (const ticket of tickets) {
        const { userId, communityId } = ticket.wallet;
        const opps = ticket.utility?.requiredForOpportunities;

        if (!userId || !communityId || !opps?.length) continue;

        for (const opp of opps) {
          results.push({
            opportunityId: opp.id,
            userId,
            communityId,
          });
        }
      }

      return results;
    },
    (record) => ({
      opportunityId: record.opportunityId,
      userId: record.userId,
      communityId: record.communityId,
    }),
    () => true, // 存在したものだけ true、null → GraphQL 側で false として扱う
  );
}
