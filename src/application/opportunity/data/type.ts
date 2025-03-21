import { Prisma } from "@prisma/client";
import { communityInclude } from "@/application/community/data/type";
import { placeInclude } from "@/application/place/data/type";
import { userInclude } from "@/application/user/data/type";
import { utilityInclude } from "@/application/utility/data/type";

export const opportunityInclude = Prisma.validator<Prisma.OpportunityInclude>()({
  community: { include: communityInclude },
  createdByUser: { include: userInclude },
  place: { include: placeInclude },
  requiredUtilities: { include: utilityInclude },
});

export const opportunitySetHostingStatusInclude = Prisma.validator<Prisma.OpportunityInclude>()({
  community: { include: communityInclude },
  createdByUser: { include: userInclude },
  place: { include: placeInclude },
  requiredUtilities: { include: utilityInclude },
  slots: { include: { participations: true } },
});

export type PrismaOpportunity = Prisma.OpportunityGetPayload<{
  include: typeof opportunityInclude;
}>;

export type PrismaOpportunitySetHostingStatus = Prisma.OpportunityGetPayload<{
  include: typeof opportunitySetHostingStatusInclude;
}>;
