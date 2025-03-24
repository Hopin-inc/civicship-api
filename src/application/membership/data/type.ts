import { Prisma } from "@prisma/client";
import { communityInclude } from "@/application/community/data/type";
import { userInclude } from "@/application/user/data/type";

export const membershipInclude = Prisma.validator<Prisma.MembershipInclude>()({
  community: { include: communityInclude },
  user: { include: userInclude },
  histories: true,
});

export type PrismaMembership = Prisma.MembershipGetPayload<{
  include: typeof membershipInclude;
}>;
