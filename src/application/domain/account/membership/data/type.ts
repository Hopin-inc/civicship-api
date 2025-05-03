import { Prisma } from "@prisma/client";
import { communityInclude } from "@/application/domain/account/community/data/type";
import { userInclude } from "@/application/domain/account/user/data/type";

export const membershipInclude = Prisma.validator<Prisma.MembershipInclude>()({
  community: { include: communityInclude },
  user: { include: userInclude },
  participationGeoViews: true,
  participationCountViews: true,
});

export const membershipSelectDetail = Prisma.validator<Prisma.MembershipSelect>()({
  id: true,
  userId: true,
  communityId: true,
  role: true,
  createdAt: true,
  updatedAt: true,
  community: { select: { id: true } },
  user: { select: { id: true } },
  participationGeoViews: true,
  participationCountViews: true,
});

export type PrismaMembership = Prisma.MembershipGetPayload<{
  include: typeof membershipInclude;
}>;

export type PrismaMembershipDetail = Prisma.MembershipGetPayload<{
  select: typeof membershipSelectDetail;
}>;
