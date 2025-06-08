import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
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

export function createUtilityLoader(issuer: PrismaClientIssuer) {
  return createLoaderById<PrismaUtilityDetail, GqlUtility>(
    async (ids) =>
      issuer.internal((tx) =>
        tx.utility.findMany({
          where: { id: { in: [...ids] } },
          select: utilitySelectDetail,
        }),
      ),
    UtilityPresenter.get,
  );
}

export function createRequiredUtilitiesByOpportunityLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlUtility[]>(async (opportunityIds) => {
    const opportunities = await issuer.internal((tx) =>
      tx.opportunity.findMany({
        where: { id: { in: [...opportunityIds] } },
        include: { 
          requiredUtilities: {
            select: utilitySelectDetail,
          }
        },
      }),
    );

    const map = new Map<string, GqlUtility[]>();
    for (const o of opportunities) {
      map.set(o.id, o.requiredUtilities.map(UtilityPresenter.get));
    }

    return opportunityIds.map((id) => map.get(id) ?? []);
  });
}

export function createUtilitiesByCommunityLoader(issuer: PrismaClientIssuer) {
  return createHasManyLoaderByKey<"communityId", PrismaUtilityDetail, GqlUtility>(
    "communityId",
    async (communityIds) => {
      return issuer.internal((tx) =>
        tx.utility.findMany({
          where: { communityId: { in: [...communityIds] } },
          select: utilitySelectDetail,
        }),
      );
    },
    UtilityPresenter.get,
  );
}
