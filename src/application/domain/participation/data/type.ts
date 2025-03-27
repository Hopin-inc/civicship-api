import { Prisma } from "@prisma/client";
import { userInclude } from "@/application/domain/user/data/type";
import { evaluationInclude } from "@/application/domain/evaluation/data/type";
import { placeInclude } from "@/application/domain/place/data/type";

export const participationInclude = Prisma.validator<Prisma.ParticipationInclude>()({
  user: { include: userInclude },
  community: true,
  opportunitySlot: { include: { opportunity: true } },
  images: true,
  evaluation: { include: evaluationInclude },
});

export type PrismaParticipation = Prisma.ParticipationGetPayload<{
  include: typeof participationInclude;
}>;

export const participationForPortfolioInclude = Prisma.validator<Prisma.ParticipationInclude>()({
  opportunitySlot: {
    include: {
      opportunity: { include: { place: { include: placeInclude } } },
      participations: { include: { user: { include: userInclude } } },
    },
  },
  images: true,
});

export type PrismaParticipationForPortfolio = Prisma.ParticipationGetPayload<{
  include: typeof participationForPortfolioInclude;
}>;
