import { Prisma } from "@prisma/client";

export const membershipAuthSelect = Prisma.validator<Prisma.MembershipSelect>()({
  role: true,
  communityId: true,
});

export const membershipInclude = Prisma.validator<Prisma.MembershipInclude>()({
  community: {
    include: {
      city: { include: { state: true } },
    },
  },
  user: true,
});

export type MembershipPayloadWithArgs = Prisma.MembershipGetPayload<{
  include: typeof membershipInclude;
}>;
