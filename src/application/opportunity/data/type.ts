import { Prisma } from "@prisma/client";
import { communityInclude } from "@/application/community/data/type";
import { placeInclude } from "@/application/place/data/type";
import { userInclude } from "@/application/user/data/type";

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
