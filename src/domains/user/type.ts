import { Prisma } from "@prisma/client";

export const authInclude = Prisma.validator<Prisma.UserInclude>()({
  identities: true,
  memberships: {
    select: {
      role: true,
      communityId: true,
    },
  },
});

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

export type AuthGetPayloadWithArgs = Prisma.UserGetPayload<{
  include: typeof authInclude;
}>;

export type UserGetPayloadWithArgs = Prisma.UserGetPayload<{
  include: typeof userInclude;
}>;
