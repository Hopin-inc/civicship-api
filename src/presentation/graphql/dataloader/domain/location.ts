import * as PlaceLoaders from "@/application/domain/location/place/controller/dataloader";
import * as MasterLocationLoaders from "@/application/domain/location/master/controller/dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

export function createLocationLoaders(issuer: PrismaClientIssuer) {
  return {
    place: PlaceLoaders.createPlaceLoader(issuer),
    placesByCommunity: PlaceLoaders.createPlacesByCommunityLoader(issuer),

    city: MasterLocationLoaders.createCityByCodeLoader(issuer),
    state: MasterLocationLoaders.createStateByCodeLoader(issuer),
  };
}
