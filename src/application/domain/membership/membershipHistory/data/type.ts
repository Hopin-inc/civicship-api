import { Prisma } from "@prisma/client";

export const membershipHistoryInclude = Prisma.validator<Prisma.MembershipHistoryInclude>()({
  createdByUser: true,
  membership: { include: { user: true, community: true } },
});

export type PrismaMembershipHistory = Prisma.MembershipHistoryGetPayload<{
  include: typeof membershipHistoryInclude;
}>;
