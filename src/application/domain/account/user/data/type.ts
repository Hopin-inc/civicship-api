import { Prisma } from "@prisma/client";
import { placeInclude } from "@/application/domain/location/place/data/type";

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
  image: true,
  identities: true,
});

export const userArticlePortfolioInclude = Prisma.validator<Prisma.UserInclude>()({
  articlesAboutMe: {
    include: {
      thumbnail: true,
      relatedUsers: { include: userInclude },
      authors: { include: userInclude },
    },
  },
  articlesWrittenByMe: {
    include: {
      thumbnail: true,
      relatedUsers: { include: userInclude },
      authors: { include: userInclude },
    },
  },
});

export const userParticipationPortfolioInclude = Prisma.validator<Prisma.UserInclude>()({
  participations: {
    include: {
      images: true,
      evaluation: { include: { vcIssuanceRequest: true } },
      reservation: {
        include: {
          opportunitySlot: {
            include: {
              opportunity: {
                include: {
                  images: true,
                  place: { include: placeInclude },
                },
              },
            },
          },
          participations: { include: { user: { include: { image: true } } } },
        },
      },
      opportunitySlot: {
        include: {
          opportunity: {
            include: {
              images: true,
              place: { include: placeInclude },
            },
          },
          participations: { include: { user: { include: { image: true } } } },
        },
      },
    },
  },
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
  phoneNumber: true,

  imageId: true,

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

export type PrismaUserArticlePortfolio = Prisma.UserGetPayload<{
  include: typeof userArticlePortfolioInclude;
}>;

export type PrismaUserParticipationPortfolio = Prisma.UserGetPayload<{
  include: typeof userParticipationPortfolioInclude;
}>;
