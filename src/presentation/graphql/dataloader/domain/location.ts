import * as PlaceLoaders from "@/application/domain/location/place/controller/dataloader";
import * as MasterLocationLoaders from "@/application/domain/location/master/controller/dataloader";
import { PrismaClient } from "@prisma/client";

export function createLocationLoaders(prisma: PrismaClient) {
  return {
    place: PlaceLoaders.createPlaceLoader(prisma),
    placesByCommunity: PlaceLoaders.createPlacesByCommunityLoader(prisma),

    city: MasterLocationLoaders.createCityByCodeLoader(prisma),
    state: MasterLocationLoaders.createStateByCodeLoader(prisma),
  };
}
