import { Prisma } from "@prisma/client";

export const communityInclude = Prisma.validator<Prisma.CommunityInclude>()({
  // city: { include: { state: true } },
});

export type CommunityPayloadWithArgs = Prisma.CommunityGetPayload<{
  include: typeof communityInclude;
}>;
