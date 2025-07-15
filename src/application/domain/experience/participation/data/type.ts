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
  evaluation: true,
  community: true,
  images: true,
});

export const participationPortfolioInclude = Prisma.validator<Prisma.ParticipationInclude>()({
  community: true,
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
      participations: { include: { user: { include: userInclude } } },
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
      participations: { include: { user: { include: userInclude } } },
    },
  },
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
  communityId: true,
  reservationId: true,
  evaluationId: true,
  opportunitySlotId: true,

  createdAt: true,
  updatedAt: true,
});

export type PrismaParticipationDetail = Prisma.ParticipationGetPayload<{
  select: typeof participationSelectDetail;
}>;

export const participationIncludeSlot = Prisma.validator<Prisma.ParticipationSelect>()({
  reason: true,
  reservation: { select: { opportunitySlot: true } },
  opportunitySlot: true,
});

export type PrismaParticipationIncludeSlot = Prisma.ParticipationGetPayload<{
  select: typeof participationIncludeSlot;
}>;

export type PrismaParticipationForPortfolioInclude = Prisma.ParticipationGetPayload<{
  include: typeof participationPortfolioInclude;
}>;
