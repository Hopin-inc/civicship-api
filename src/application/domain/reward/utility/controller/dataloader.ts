import DataLoader from "dataloader";
import { PrismaClient } from "@prisma/client";
import { GqlUtility } from "@/types/graphql";
import UtilityPresenter from "@/application/domain/reward/utility/presenter";
import {
  PrismaUtilityDetail,
  utilitySelectDetail,
} from "@/application/domain/reward/utility/data/type";
import {
  createHasManyLoaderByKey,
  createLoaderById,
} from "@/presentation/graphql/dataloader/utils";

export function createUtilityLoader(prisma: PrismaClient) {
  return createLoaderById<PrismaUtilityDetail, GqlUtility>(
    async (ids) =>
      prisma.utility.findMany({
        where: { id: { in: [...ids] } },
        select: utilitySelectDetail,
      }),
    UtilityPresenter.get,
  );
}

export function createRequiredUtilitiesByOpportunityLoader(prisma: PrismaClient) {
  return new DataLoader<string, GqlUtility[]>(async (opportunityIds) => {
    const opportunities = await prisma.opportunity.findMany({
      where: { id: { in: [...opportunityIds] } },
      include: { requiredUtilities: true },
    });

    const map = new Map<string, GqlUtility[]>();
    for (const o of opportunities) {
      map.set(o.id, o.requiredUtilities.map(UtilityPresenter.get));
    }

    return opportunityIds.map((id) => map.get(id) ?? []);
  });
}

export function createUtilitiesByCommunityLoader(prisma: PrismaClient) {
  return createHasManyLoaderByKey<"communityId", PrismaUtilityDetail, GqlUtility>(
    "communityId",
    async (communityIds) => {
      return prisma.utility.findMany({
        where: { communityId: { in: [...communityIds] } },
      });
    },
    UtilityPresenter.get,
  );
}
