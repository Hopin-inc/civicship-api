import { Prisma } from "@prisma/client";
import { opportunityInclude } from "@/application/opportunity/infrastructure/type";

export const opportunitySlotInclude = Prisma.validator<Prisma.OpportunitySlotInclude>()({
  opportunity: {
    include: opportunityInclude,
  },
});

export type OpportunitySlotPayloadWithArgs = Prisma.OpportunitySlotGetPayload<{
  include: typeof opportunitySlotInclude;
}>;
