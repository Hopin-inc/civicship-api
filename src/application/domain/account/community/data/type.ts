import { Prisma } from "@prisma/client";
import { placeInclude } from "@/application/domain/location/place/data/type";

export const communityInclude = Prisma.validator<Prisma.CommunityInclude>()({
  places: { include: placeInclude },
  image: true,
});

export type PrismaCommunity = Prisma.CommunityGetPayload<{
  include: typeof communityInclude;
}>;
