import { Prisma } from "@prisma/client";
import { communityInclude } from "@/application/domain/account/community/data/type";
import { placeInclude } from "@/application/domain/location/place/data/type";
import { userInclude } from "@/application/domain/account/user/data/type";
import { utilityInclude } from "@/application/domain/reward/utility/data/type";

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

export const opportunitySelectDetail = Prisma.validator<Prisma.OpportunitySelect>()({
  id: true,
  title: true,
  description: true,
  publishStatus: true,
  requireApproval: true,
  category: true,
  body: true,
  pointsToEarn: true,
  feeRequired: true,
  pointsRequired: true,

  communityId: true,
  placeId: true,
  createdBy: true,

  createdAt: true,
  updatedAt: true,
});

export type PrismaOpportunity = Prisma.OpportunityGetPayload<{
  include: typeof opportunityInclude;
}>;

export type PrismaOpportunitySetHostingStatus = Prisma.OpportunityGetPayload<{
  include: typeof opportunitySetHostingStatusInclude;
}>;

export type PrismaOpportunityDetail = Prisma.OpportunityGetPayload<{
  select: typeof opportunitySelectDetail;
}>;
