import { Prisma } from "@prisma/client";
import { userInclude } from "@/application/user/data/type";

export const participationInclude = Prisma.validator<Prisma.ParticipationInclude>()({
  user: { include: userInclude },
  community: true,
  opportunitySlot: { include: { opportunity: true } },
});

export type PrismaParticipation = Prisma.ParticipationGetPayload<{
  include: typeof participationInclude;
}>;
