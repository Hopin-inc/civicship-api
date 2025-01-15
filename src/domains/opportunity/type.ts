import { Prisma } from "@prisma/client";

export const opportunityInclude = Prisma.validator<Prisma.OpportunityInclude>()({
  community: {
    include: {
      city: { include: { state: true } },
      wallets: {
        include: {
          community: {
            include: {
              city: { include: { state: true } },
            },
          },
          user: true,
          currentPointView: true,
        },
      },
    },
  },
  createdByUser: true,
  city: { include: { state: true } },
  state: true,
  participations: {
    include: {
      user: true,
    },
  },
});

export type OpportunityPayloadWithArgs = Prisma.OpportunityGetPayload<{
  include: typeof opportunityInclude;
}>;
