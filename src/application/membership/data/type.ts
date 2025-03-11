import { Prisma } from "@prisma/client";
import { communityInclude } from "@/application/community/data/type";
import { userInclude } from "@/application/user/data/type";

export const membershipAuthSelect = Prisma.validator<Prisma.MembershipSelect>()({
  role: true,
  communityId: true,
});

export const membershipInclude = Prisma.validator<Prisma.MembershipInclude>()({
  community: { include: communityInclude },
  user: { include: userInclude },
});

export type PrismaMembership = Prisma.MembershipGetPayload<{
  include: typeof membershipInclude;
}>;
