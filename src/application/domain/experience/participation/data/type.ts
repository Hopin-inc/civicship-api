import { Prisma } from "@prisma/client";
import { userInclude } from "@/application/domain/account/user/data/type";
import { placeInclude } from "@/application/domain/location/place/data/type";

export const participationInclude = Prisma.validator<Prisma.ParticipationInclude>()({
  user: { include: userInclude },
  reservation: {
    include: {
      opportunitySlot: { include: { opportunity: true } },
    },
  },
  community: true,
  images: true,
});

export const portfolioFromParticipationInclude = Prisma.validator<Prisma.ParticipationInclude>()({
  reservation: {
    include: {
      opportunitySlot: {
        include: {
          opportunity: {
            include: {
              images: true,
              place: true,
            },
          },
        },
      },
      participations: { include: { user: true } },
    },
  },
  images: true,
});

export type PrismaParticipation = Prisma.ParticipationGetPayload<{
  include: typeof participationInclude;
}>;

export const participationSelectDetail = Prisma.validator<Prisma.ParticipationSelect>()({
  id: true,
  status: true,
  reason: true,
  source: true,

  userId: true,
  reservationId: true,
  communityId: true,

  createdAt: true,
  updatedAt: true,
});

export type PrismaParticipationDetail = Prisma.ParticipationGetPayload<{
  select: typeof participationSelectDetail;
}>;

export const participationForPortfolioInclude = Prisma.validator<Prisma.ParticipationInclude>()({
  reservation: {
    include: {
      opportunitySlot: {
        include: {
          opportunity: {
            include: {
              place: { include: placeInclude },
              images: true,
            },
          },
        },
      },
      participations: { include: { user: { include: userInclude } } },
    },
  },
  images: true,
});

export type PrismaParticipationForPortfolio = Prisma.ParticipationGetPayload<{
  include: typeof participationForPortfolioInclude;
}>;
