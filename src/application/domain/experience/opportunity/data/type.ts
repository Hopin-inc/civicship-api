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
  name: true,
  description: true,
  publishStatus: true,
  hostingStatus: true,
  startAt: true,
  endAt: true,
  capacity: true,
  communityId: true,
  createdByUserId: true,
  placeId: true,
  createdAt: true,
  updatedAt: true,
  community: { select: { id: true } },
  createdByUser: { select: { id: true } },
  place: { select: { id: true } },
  images: { select: { id: true, url: true } },
  requiredUtilities: { select: { id: true } },
  earliestReservableSlotView: { select: { id: true, opportunityId: true, startAt: true } },
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
