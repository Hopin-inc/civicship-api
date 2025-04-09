import { Prisma } from "@prisma/client";
import { communityInclude } from "@/application/domain/community/data/type";
import { userInclude } from "@/application/domain/user/data/type";

export const membershipInclude = Prisma.validator<Prisma.MembershipInclude>()({
  community: { include: communityInclude },
  user: { include: userInclude },
  participationGeoViews: true,
  participationCountViews: true,
});

export type PrismaMembership = Prisma.MembershipGetPayload<{
  include: typeof membershipInclude;
}>;
