import { Prisma } from "@prisma/client";

export const organizationBaseInclude = Prisma.validator<Prisma.OrganizationInclude>()({
  city: { include: { state: true } },
  state: true,
});

export type OrganizationBasePayloadWithArgs = Prisma.OrganizationGetPayload<{
  include: typeof organizationBaseInclude;
}>;
