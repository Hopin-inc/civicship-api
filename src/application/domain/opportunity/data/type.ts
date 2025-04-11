import { Prisma } from "@prisma/client";
import { communityInclude } from "@/application/domain/community/data/type";
import { placeInclude } from "@/application/domain/place/data/type";
import { userInclude } from "@/application/domain/user/data/type";
import { utilityInclude } from "@/application/domain/utility/data/type";

export const opportunityInclude = Prisma.validator<Prisma.OpportunityInclude>()({
  community: { include: communityInclude },
  createdByUser: { include: userInclude },
  place: { include: placeInclude },
  images: true,
  requiredUtilities: { include: utilityInclude },
  earliestReservableSlotView: true,
});

export const opportunitySetHostingStatusInclude = Prisma.validator<Prisma.OpportunityInclude>()({
  community: { include: communityInclude },
  createdByUser: { include: userInclude },
  place: { include: placeInclude },
  requiredUtilities: { include: utilityInclude },
  earliestReservableSlotView: true,
  images: true,
});

export type PrismaOpportunity = Prisma.OpportunityGetPayload<{
  include: typeof opportunityInclude;
}>;

export type PrismaOpportunitySetHostingStatus = Prisma.OpportunityGetPayload<{
  include: typeof opportunitySetHostingStatusInclude;
}>;
