import { Prisma } from "@prisma/client";

export const userAuthInclude = Prisma.validator<Prisma.UserInclude>()({
  identities: true,
});

export const userInclude = Prisma.validator<Prisma.UserInclude>()({});

export type UserGetPayloadWithArgs = Prisma.UserGetPayload<{
  include: typeof userInclude;
}>;
