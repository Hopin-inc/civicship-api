import { Prisma } from "@prisma/client";

export const placeInclude = Prisma.validator<Prisma.PlaceInclude>()({
  city: { include: { state: true } },
});

export type PlacePayloadWithArgs = Prisma.PlaceGetPayload<{
  include: typeof placeInclude;
}>;
