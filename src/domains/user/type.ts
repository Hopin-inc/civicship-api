import { Prisma } from "@prisma/client";
import { membershipAuthGetPayloadWithArgs } from "@/domains/membership/type";

export const authInclude = Prisma.validator<Prisma.UserInclude>()({
  identities: true,
});

export const userInclude = Prisma.validator<Prisma.UserInclude>()({});

export type AuthGetPayloadWithArgs = Prisma.UserGetPayload<{
  include: typeof authInclude;
}> & {
  memberships?: membershipAuthGetPayloadWithArgs[];
};

export type UserGetPayloadWithArgs = Prisma.UserGetPayload<{
  include: typeof userInclude;
}>;
