import { Prisma } from "@prisma/client";

export const cityInclude = Prisma.validator<Prisma.CityInclude>()({
  state: true,
});

export type PrismaCity = Prisma.CityGetPayload<{
  include: typeof cityInclude;
}>;
