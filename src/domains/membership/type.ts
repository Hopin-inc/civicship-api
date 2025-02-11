import { Prisma } from "@prisma/client";

export const authSelect = Prisma.validator<Prisma.MembershipSelect>()({
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

export type membershipAuthGetPayloadWithArgs = Prisma.MembershipGetPayload<{
  select: typeof authSelect;
}>;

export type MembershipPayloadWithArgs = Prisma.MembershipGetPayload<{
  include: typeof membershipInclude;
}>;
