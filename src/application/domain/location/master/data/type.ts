import { Prisma } from "@prisma/client";

export const cityInclude = Prisma.validator<Prisma.CityInclude>()({
  state: true,
});

export const citySelectDetail = Prisma.validator<Prisma.CitySelect>()({
  id: true,
  name: true,
  code: true,
  stateId: true,
  state: { select: { id: true, name: true, code: true, countryCode: true } },
});

export type PrismaCity = Prisma.CityGetPayload<{
  include: typeof cityInclude;
}>;

export type PrismaCityDetail = Prisma.CityGetPayload<{
  select: typeof citySelectDetail;
}>;
