import { Prisma } from "@prisma/client";

export const userInclude = Prisma.validator<Prisma.UserInclude>()({
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
  wallets: {
    include: {
      community: {
        include: {
          city: { include: { state: true } },
        },
      },
      currentPointView: true,
    },
  },
});

export type UserGetPayloadWithArgs = Prisma.UserGetPayload<{
  include: typeof userInclude;
}>;
