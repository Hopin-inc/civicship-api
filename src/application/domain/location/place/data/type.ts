import { Prisma } from "@prisma/client";
import { cityInclude } from "@/application/domain/location/master/data/type";

export const placeInclude = Prisma.validator<Prisma.PlaceInclude>()({
  community: true,
  city: { include: cityInclude },
});

export const placeSelectDetail = Prisma.validator<Prisma.PlaceSelect>()({
  id: true,
  name: true,
  address: true,
  latitude: true,
  longitude: true,
  communityId: true,
  cityCode: true,
  imageId: true,
  isManual: true,
  googlePlaceId: true,
  mapLocation: true,
  createdAt: true,
  updatedAt: true,
  community: { select: { id: true } },
  city: { select: { code: true, name: true, state: { select: { code: true, name: true, countryCode: true } } } },
});

export type PrismaPlace = Prisma.PlaceGetPayload<{
  include: typeof placeInclude;
}>;

export type PrismaPlaceDetail = Prisma.PlaceGetPayload<{
  select: typeof placeSelectDetail;
}>;
