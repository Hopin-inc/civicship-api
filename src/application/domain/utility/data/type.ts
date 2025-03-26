import { Prisma } from "@prisma/client";

export const utilityInclude = Prisma.validator<Prisma.UtilityInclude>()({
  community: true,
});

export type PrismaUtility = Prisma.UtilityGetPayload<{
  include: typeof utilityInclude;
}>;
