import { Prisma } from "@prisma/client";
import { utilityInclude } from "@/infrastructure/prisma/types/utility";
import { opportunityInclude } from "@/infrastructure/prisma/types/opportunity/index";

export const opportunityRequiredUtilityInclude =
  Prisma.validator<Prisma.OpportunityRequiredUtilityInclude>()({
    opportunity: { include: opportunityInclude },
    utility: { include: utilityInclude },
  });

export type OpportunityRequiredUtilityPayloadWithArgs =
  Prisma.OpportunityRequiredUtilityGetPayload<{
    include: typeof opportunityRequiredUtilityInclude;
  }>;
