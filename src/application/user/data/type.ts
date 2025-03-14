import { Prisma } from "@prisma/client";

export const userAuthSelect = Prisma.validator<Prisma.UserSelect>()({
  memberships: {
    select: {
      role: true,
      communityId: true,
    },
  },
  opportunitiesCreatedByMe: {
    select: {
      id: true,
    },
  },
  opportunityInvitations: {
    select: {
      createdBy: true,
    },
  },
  articlesAboutMe: {
    select: {
      id: true,
    },
  },
  articlesWrittenByMe: {
    select: {
      id: true,
    },
  },
});

export type PrismaUserPermission = Prisma.UserGetPayload<{
  select: typeof userAuthSelect;
}>;

export const userAuthInclude = Prisma.validator<Prisma.UserInclude>()({
  identities: true,
});

export const userInclude = Prisma.validator<Prisma.UserInclude>()({});

export type PrismaUser = Prisma.UserGetPayload<{
  include: typeof userInclude;
}>;
