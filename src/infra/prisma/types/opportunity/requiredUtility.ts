import { Prisma } from "@prisma/client";
import { utilityInclude } from "@/infra/prisma/types/utility";
import { opportunityInclude } from "@/infra/prisma/types/opportunity/index";

export const opportunityRequiredUtilityInclude =
  Prisma.validator<Prisma.OpportunityRequiredUtilityInclude>()({
    opportunity: { include: opportunityInclude },
    utility: { include: utilityInclude },
  });

export type OpportunityRequiredUtilityPayloadWithArgs =
  Prisma.OpportunityRequiredUtilityGetPayload<{
    include: typeof opportunityRequiredUtilityInclude;
  }>;
