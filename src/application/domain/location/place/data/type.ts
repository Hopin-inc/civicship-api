import { Prisma } from "@prisma/client";
import { cityInclude } from "@/application/domain/location/master/data/type";

export const placeInclude = Prisma.validator<Prisma.PlaceInclude>()({
  // community: true,
  city: { include: cityInclude },
});

export const placeSelectDetail = Prisma.validator<Prisma.PlaceSelect>()({
  id: true,
  name: true,
  address: true,
  latitude: true,
  longitude: true,
  isManual: true,
  googlePlaceId: true,
  mapLocation: true,

  communityId: true,
  cityCode: true,
  imageId: true,
  opportunities: { select: { id: true } },

  createdAt: true,
  updatedAt: true,
});

export type PrismaPlace = Prisma.PlaceGetPayload<{
  include: typeof placeInclude;
}>;

export type PrismaPlaceDetail = Prisma.PlaceGetPayload<{
  select: typeof placeSelectDetail;
}>;
