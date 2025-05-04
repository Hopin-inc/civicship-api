import { Prisma } from "@prisma/client";

export const membershipInclude = Prisma.validator<Prisma.MembershipInclude>()({
  user: { include: { identities: true } },
});

export const membershipSelectDetail = Prisma.validator<Prisma.MembershipSelect>()({
  userId: true,
  communityId: true,
  headline: true,
  bio: true,
  status: true,
  reason: true,
  role: true,
  createdAt: true,
  updatedAt: true,
  participationGeoViews: true,
  participationCountViews: true,
});

export type PrismaMembership = Prisma.MembershipGetPayload<{
  include: typeof membershipInclude;
}>;

export type PrismaMembershipDetail = Prisma.MembershipGetPayload<{
  select: typeof membershipSelectDetail;
}>;
