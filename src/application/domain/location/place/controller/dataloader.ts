import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
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

export function createPlaceLoader(issuer: PrismaClientIssuer) {
  return createLoaderById<PrismaPlaceDetail, GqlPlace>(
    async (ids) =>
      issuer.internal((tx) =>
        tx.place.findMany({
          where: { id: { in: [...ids] } },
          select: placeSelectDetail,
        }),
      ),
    PlacePresenter.get,
  );
}

export function createPlacesByCommunityLoader(issuer: PrismaClientIssuer) {
  return createHasManyLoaderByKey<"communityId", PrismaPlaceDetail, GqlPlace>(
    "communityId",
    async (communityIds) => {
      return issuer.internal((tx) =>
        tx.place.findMany({
          where: { communityId: { in: [...communityIds] } },
        }),
      );
    },
    PlacePresenter.get,
  );
}
