import { Prisma } from "@prisma/client";

export const cityDefaultInclude = Prisma.validator<Prisma.CityInclude>()({
  state: true,
});

export type CityDefaultPayloadWithArgs = Prisma.CityGetPayload<{
  include: typeof cityDefaultInclude;
}>;
