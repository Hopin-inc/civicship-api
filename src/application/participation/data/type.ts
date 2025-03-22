import { Prisma } from "@prisma/client";
import { userInclude } from "@/application/user/data/type";
import { evaluationInclude } from "@/application/evaluation/data/type";

export const participationInclude = Prisma.validator<Prisma.ParticipationInclude>()({
  user: { include: userInclude },
  community: true,
  opportunitySlot: { include: { opportunity: true } },
  images: true,
  evaluation: { include: evaluationInclude },
  opportunityInvitationHistory: { include: { invitation: true } },
});

export type PrismaParticipation = Prisma.ParticipationGetPayload<{
  include: typeof participationInclude;
}>;
