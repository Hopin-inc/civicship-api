import { Prisma } from "@prisma/client";
import { placeInclude } from "@/application/place/data/type";

export const communityInclude = Prisma.validator<Prisma.CommunityInclude>()({
  places: { include: placeInclude },
});

export type PrismaCommunity = Prisma.CommunityGetPayload<{
  include: typeof communityInclude;
}>;
