import { Prisma } from "@prisma/client";

export const opportunitySlotInclude = Prisma.validator<Prisma.OpportunitySlotInclude>()({
  opportunity: {
    include: {
      requiredUtilities: {
        include: {
          community: true,
        },
      },
    },
  },
});

export type PrismaOpportunitySlot = Prisma.OpportunitySlotGetPayload<{
  include: typeof opportunitySlotInclude;
}>;
