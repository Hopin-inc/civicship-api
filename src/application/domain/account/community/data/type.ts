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

  memberships: { select: { userId: true, communityId: true } },
  wallets: { select: { id: true } },

  opportunities: { select: { id: true } },
  participations: { select: { id: true } },
  places: { select: { id: true } },

  utilities: { select: { id: true } },

  articles: { select: { id: true } },
});

export const communityCreateSelect = Prisma.validator<Prisma.CommunitySelect>()({
  id: true,
  name: true,
  bio: true,
  createdAt: true,
  updatedAt: true,

  imageId: true,
  config: {
    select: {
      lineConfig: { select: { liffId: true, channelId: true, richMenus: true, liffBaseUrl: true } },
    },
  },
});

export type PrismaCommunityDetail = Prisma.CommunityGetPayload<{
  select: typeof communitySelectDetail;
}>;

export type PrismaCommunityCreateDetail = Prisma.CommunityGetPayload<{
  select: typeof communityCreateSelect;
}>;
