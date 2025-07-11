import { Prisma } from "@prisma/client";

export const membershipInclude = Prisma.validator<Prisma.MembershipInclude>()({
  user: {
    include: {
      identities: {
        include: { community: true },
      },
    },
  },
  community: true,
});

export const membershipSelectDetail = Prisma.validator<Prisma.MembershipSelect>()({
  headline: true,
  bio: true,
  status: true,
  reason: true,
  role: true,

  opportunityHostedCountView: true,
  participationGeoViews: true,
  participationCountViews: true,

  userId: true,
  communityId: true,

  createdAt: true,
  updatedAt: true,

  user: true,
  community: true,
});

export type PrismaMembership = Prisma.MembershipGetPayload<{
  include: typeof membershipInclude;
}>;

export type PrismaMembershipDetail = Prisma.MembershipGetPayload<{
  select: typeof membershipSelectDetail;
}>;
