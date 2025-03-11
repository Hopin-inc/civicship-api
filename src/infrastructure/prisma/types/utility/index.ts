import { Prisma } from "@prisma/client";

export const utilityInclude = Prisma.validator<Prisma.UtilityInclude>()({
  community: true,
});

export type UtilityGetPayloadWithArgs = Prisma.UtilityGetPayload<{
  include: typeof utilityInclude;
}>;
