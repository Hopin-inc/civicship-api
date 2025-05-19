import { Prisma } from "@prisma/client";
import { userInclude } from "@/application/domain/account/user/data/type";

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
  status: true,
  reason: true,
  source: true,

  userId: true,
  communityId: true,
  reservationId: true,
  evaluationId: true,

  createdAt: true,
  updatedAt: true,
});

export type PrismaParticipationDetail = Prisma.ParticipationGetPayload<{
  select: typeof participationSelectDetail;
}>;

export const participationIncludeSlot = Prisma.validator<Prisma.ParticipationSelect>()({
  reservation: { select: { opportunitySlot: true } },
});

export type PrismaParticipationIncludeSlot = Prisma.ParticipationGetPayload<{
  select: typeof participationIncludeSlot;
}>;
