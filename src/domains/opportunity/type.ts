import { Prisma } from "@prisma/client";

export const opportunityInclude = Prisma.validator<Prisma.OpportunityInclude>()({
  community: {
    include: {
      city: { include: { state: true } },
    },
  },
  createdByUser: true,
  city: { include: { state: true } },
});

export type OpportunityPayloadWithArgs = Prisma.OpportunityGetPayload<{
  include: typeof opportunityInclude;
}>;
