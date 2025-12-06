import { PrismaClient } from "@prisma/client";
import { GqlPlace } from "@/types/graphql";
import PlacePresenter from "@/application/domain/location/place/presenter";
import {
  placeSelectDetail,
  PrismaPlaceDetail,
} from "@/application/domain/location/place/data/type";
import {
  createHasManyLoaderByKey,
  createLoaderById,
} from "@/presentation/graphql/dataloader/utils";

export function createPlaceLoader(prisma: PrismaClient) {
  return createLoaderById<PrismaPlaceDetail, GqlPlace>(
    async (ids) =>
      prisma.place.findMany({
        where: { id: { in: [...ids] } },
        select: placeSelectDetail,
      }),
    PlacePresenter.get,
  );
}

export function createPlacesByCommunityLoader(prisma: PrismaClient) {
  return createHasManyLoaderByKey<"communityId", PrismaPlaceDetail, GqlPlace>(
    "communityId",
    async (communityIds) => {
      return prisma.place.findMany({
        where: { communityId: { in: [...communityIds] } },
        include: { currentPublicOpportunityCount: true, accumulatedParticipants: true },
      });
    },
    PlacePresenter.get,
  );
}
