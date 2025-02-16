import { Prisma } from "@prisma/client";

export const utilityInclude = Prisma.validator<Prisma.UtilityInclude>()({
  community: true,
  // community: {
  //   include: { city: { include: { state: true } } },
  // },
});

export type UtilityGetPayloadWithArgs = Prisma.UtilityGetPayload<{
  include: typeof utilityInclude;
}>;
