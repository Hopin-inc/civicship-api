import { Prisma } from "@prisma/client";
import { placeInclude } from "@/application/domain/location/place/data/type";

export const communityInclude = Prisma.validator<Prisma.CommunityInclude>()({
  places: { include: placeInclude },
  image: true,
});

export const communitySelectDetail = Prisma.validator<Prisma.CommunitySelect>()({
  id: true,
  name: true,
  bio: true,
  imageId: true,
  createdAt: true,
  updatedAt: true,
  places: { select: { id: true } },
  memberships: { select: { userId: true, communityId: true } },
});

export type PrismaCommunity = Prisma.CommunityGetPayload<{
  include: typeof communityInclude;
}>;

export type PrismaCommunityDetail = Prisma.CommunityGetPayload<{
  select: typeof communitySelectDetail;
}>;
