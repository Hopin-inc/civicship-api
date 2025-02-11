import { Prisma } from "@prisma/client";

export const authInclude = Prisma.validator<Prisma.UserInclude>()({
  identities: true,
});

export const userInclude = Prisma.validator<Prisma.UserInclude>()({});

export type AuthGetPayloadWithArgs = Prisma.UserGetPayload<{
  include: typeof authInclude;
}>;

export type UserGetPayloadWithArgs = Prisma.UserGetPayload<{
  include: typeof userInclude;
}>;
