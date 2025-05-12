import { Prisma } from "@prisma/client";

export const cityInclude = Prisma.validator<Prisma.CityInclude>()({
  state: true,
});

export const citySelectDetail = Prisma.validator<Prisma.CitySelect>()({
  name: true,
  code: true,
  stateCode: true,
});

export type PrismaCity = Prisma.CityGetPayload<{
  include: typeof cityInclude;
}>;

export type PrismaCityDetail = Prisma.CityGetPayload<{
  select: typeof citySelectDetail;
}>;
