import { Prisma } from "@prisma/client";
import { userInclude } from "@/application/domain/user/data/type";
import { placeInclude } from "@/application/domain/place/data/type";

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
