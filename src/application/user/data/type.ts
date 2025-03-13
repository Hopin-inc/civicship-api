import { Prisma } from "@prisma/client";

export const userAuthInclude = Prisma.validator<Prisma.UserInclude>()({
  identities: true,
  opportunityInvitations: true,
});

export const userInclude = Prisma.validator<Prisma.UserInclude>()({});

export type PrismaUser = Prisma.UserGetPayload<{
  include: typeof userInclude;
}>;
