import { Prisma } from "@prisma/client";
import { cityInclude } from "@/application/domain/master/data/type";

export const placeInclude = Prisma.validator<Prisma.PlaceInclude>()({
  community: true,
  city: { include: cityInclude },
});

export type PrismaPlace = Prisma.PlaceGetPayload<{
  include: typeof placeInclude;
}>;
