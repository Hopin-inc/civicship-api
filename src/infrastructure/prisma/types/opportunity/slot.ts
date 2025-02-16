import { Prisma } from "@prisma/client";
import { opportunityInclude } from "@/infrastructure/prisma/types/opportunity/index";

export const opportunitySlotInclude = Prisma.validator<Prisma.OpportunitySlotInclude>()({
  opportunity: {
    include: opportunityInclude,
  },
});

export type OpportunitySlotPayloadWithArgs = Prisma.OpportunitySlotGetPayload<{
  include: typeof opportunitySlotInclude;
}>;
