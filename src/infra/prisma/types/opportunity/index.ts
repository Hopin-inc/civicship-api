import { Prisma } from "@prisma/client";
import { communityInclude } from "@/infra/prisma/types/community";
import { placeInclude } from "@/infra/prisma/types/place";
import { userInclude } from "@/infra/prisma/types/user";

export const opportunityAuthSelect = Prisma.validator<Prisma.OpportunitySelect>()({
  id: true,
});

export const opportunityInclude = Prisma.validator<Prisma.OpportunityInclude>()({
  community: { include: communityInclude },
  createdByUser: { include: userInclude },
  place: { include: placeInclude },
  requiredUtilities: true,
});

export type OpportunityPayloadWithArgs = Prisma.OpportunityGetPayload<{
  include: typeof opportunityInclude;
}>;
