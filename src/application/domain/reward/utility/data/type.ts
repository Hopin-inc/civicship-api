import { Prisma } from "@prisma/client";

export const utilityInclude = Prisma.validator<Prisma.UtilityInclude>()({
  community: true,
});

export const utilitySelectDetail = Prisma.validator<Prisma.UtilitySelect>()({
  id: true,
  name: true,
  description: true,
  pointsRequired: true,
  publishStatus: true,

  communityId: true,
  images: { select: { id: true } },
  tickets: { select: { id: true } },
  requiredForOpportunities: { select: { id: true } },

  createdAt: true,
  updatedAt: true,
});

export type PrismaUtility = Prisma.UtilityGetPayload<{
  include: typeof utilityInclude;
}>;

export type PrismaUtilityDetail = Prisma.UtilityGetPayload<{
  select: typeof utilitySelectDetail;
}>;
