import { Prisma } from "@prisma/client";
import { opportunityInclude } from "@/domains/opportunity/type";

export const opportunitySlotInclude = Prisma.validator<Prisma.OpportunitySlotInclude>()({
  opportunity: {
    include: opportunityInclude,
  },
});

export type OpportunitySlotPayloadWithArgs = Prisma.OpportunitySlotGetPayload<{
  include: typeof opportunitySlotInclude;
}>;
