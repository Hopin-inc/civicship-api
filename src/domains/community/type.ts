import { Prisma } from "@prisma/client";

export const communityInclude = Prisma.validator<Prisma.CommunityInclude>()({
  city: {
    include: {
      state: true,
    },
  },
  state: true,
  memberships: {
    include: {
      community: {
        include: {
          city: { include: { state: true } },
        },
      },
      user: true,
    },
  },
  opportunities: {
    include: {
      createdByUser: true,
      community: {
        include: {
          city: { include: { state: true } },
        },
      },
      city: { include: { state: true } },
    },
  },
  participations: {
    include: {
      user: true,
      community: {
        include: {
          city: { include: { state: true } },
        },
      },
      opportunity: {
        include: {
          createdByUser: true,
          community: {
            include: {
              city: { include: { state: true } },
            },
          },
          city: { include: { state: true } },
        },
      },
    },
  },
  wallets: {
    include: {
      user: true,
      community: {
        include: {
          city: { include: { state: true } },
        },
      },
      currentPointView: true,
    },
  },
  utility: {
    include: {
      community: {
        include: {
          city: { include: { state: true } },
        },
      },
    },
  },
});

export type CommunityPayloadWithArgs = Prisma.CommunityGetPayload<{
  include: typeof communityInclude;
}>;
