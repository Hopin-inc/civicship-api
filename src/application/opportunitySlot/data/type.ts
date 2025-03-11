import { Prisma } from "@prisma/client";
import { opportunityInclude } from "@/application/opportunity/data/type";

export const opportunitySlotInclude = Prisma.validator<Prisma.OpportunitySlotInclude>()({
  opportunity: { include: opportunityInclude },
});

export type PrismaOpportunitySlot = Prisma.OpportunitySlotGetPayload<{
  include: typeof opportunitySlotInclude;
}>;
