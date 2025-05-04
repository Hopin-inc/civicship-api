import { Prisma } from "@prisma/client";

export const userAuthSelect = Prisma.validator<Prisma.UserSelect>()({
  memberships: {
    select: {
      role: true,
      communityId: true,
    },
  },
  participations: {
    select: {
      ticketStatusHistories: {
        select: {
          ticket: {
            select: {
              status: true,
              reason: true,
              utilityId: true,
            },
          },
        },
      },
    },
  },
  opportunitiesCreatedByMe: {
    select: {
      id: true,
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

export const userInclude = Prisma.validator<Prisma.UserInclude>()({
  identities: true,
  image: true,
});

export const userSelectDetail = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  name: true,
  slug: true,
  bio: true,
  sysRole: true,
  currentPrefecture: true,
  urlWebsite: true,
  urlX: true,
  urlFacebook: true,
  urlInstagram: true,
  urlYoutube: true,
  urlTiktok: true,

  imageId: true,
  identities: { select: { uid: true } },

  memberships: { select: { communityId: true, userId: true } },
  membershipChangedByMe: { select: { id: true } },
  wallets: { select: { id: true } },
  ticketIssuedByMe: { select: { id: true } },
  ticketStatusChangedByMe: { select: { id: true } },

  opportunitiesCreatedByMe: { select: { id: true } },
  reservationsAppliedByMe: { select: { id: true } },
  reservationStatusChangedByMe: { select: { id: true } },
  participations: { select: { id: true } },
  participationStatusChangedByMe: { select: { id: true } },
  evaluationsEvaluatedByMe: { select: { id: true } },
  evaluationCreatedByMe: { select: { id: true } },

  articlesWrittenByMe: { select: { id: true } },
  articlesAboutMe: { select: { id: true } },

  createdAt: true,
  updatedAt: true,
});

export type PrismaAuthUser = Prisma.UserGetPayload<{
  include: typeof userAuthInclude;
}>;

export type PrismaUser = Prisma.UserGetPayload<{
  include: typeof userInclude;
}>;

export type PrismaUserDetail = Prisma.UserGetPayload<{
  select: typeof userSelectDetail;
}>;
