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

export type PrismaParticipation = Prisma.ParticipationGetPayload<{
  include: typeof participationInclude;
}>;

export const participationSelectDetail = Prisma.validator<Prisma.ParticipationSelect>()({
  id: true,
  userId: true,
  reservationId: true,
  communityId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { id: true } },
  reservation: { 
    select: { 
      id: true,
      opportunitySlotId: true,
      opportunitySlot: { select: { id: true, opportunityId: true } }
    } 
  },
  community: { select: { id: true } },
  images: { select: { id: true, url: true } },
});

export type PrismaParticipationDetail = Prisma.ParticipationGetPayload<{
  select: typeof participationSelectDetail;
}>;

export const participationForPortfolioInclude = Prisma.validator<Prisma.ParticipationInclude>()({
  reservation: {
    include: {
      opportunitySlot: {
        include: {
          opportunity: { include: { place: { include: placeInclude }, images: true } },
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
