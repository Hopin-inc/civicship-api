import { Prisma } from "@prisma/client";

export const opportunityAuthSelect = Prisma.validator<Prisma.OpportunitySelect>()({
  id: true,
});

export const opportunityInclude = Prisma.validator<Prisma.OpportunityInclude>()({
  community: true,
  // community: {
  //   include: {
  //     city: { include: { state: true } },
  //   },
  // },
  createdByUser: true,
  // city: { include: { state: true } },
  place: true,
});

export type OpportunityPayloadWithArgs = Prisma.OpportunityGetPayload<{
  include: typeof opportunityInclude;
}>;
