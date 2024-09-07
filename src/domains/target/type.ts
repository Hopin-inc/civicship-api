import { Prisma } from "@prisma/client";

export const targetDefaultInclude = Prisma.validator<Prisma.TargetInclude>()({
  index: true,
  organization: { include: { city: { include: { state: true } }, state: true } },
  group: true,
});

export type TargetDefaultPayloadWithArgs = Prisma.TargetGetPayload<{
  include: typeof targetDefaultInclude;
}>;
