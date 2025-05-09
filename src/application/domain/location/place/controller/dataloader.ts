import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { GqlPlace } from "@/types/graphql";
import PlacePresenter from "@/application/domain/location/place/presenter";
import {
  placeSelectDetail,
  PrismaPlaceDetail,
} from "@/application/domain/location/place/data/type";
import { createHasManyLoaderByKey } from "@/presentation/graphql/dataloader/utils";

async function batchPlacesById(
  issuer: PrismaClientIssuer,
  placeIds: readonly string[],
): Promise<(GqlPlace | null)[]> {
  const records = await issuer.internal(async (tx) => {
    return tx.place.findMany({
      where: { id: { in: [...placeIds] } },
      select: placeSelectDetail,
    });
  });

  const map = new Map(records.map((record) => [record.id, PlacePresenter.get(record)]));

  return placeIds.map((id) => map.get(id) ?? null);
}

export function createPlaceLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlPlace | null>((keys) => batchPlacesById(issuer, keys));
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
