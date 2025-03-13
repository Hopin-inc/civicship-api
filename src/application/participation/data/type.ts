import { Prisma } from "@prisma/client";
import { opportunityInclude } from "@/application/opportunity/data/type";
import { userInclude } from "@/application/user/data/type";

export const participationInclude = Prisma.validator<Prisma.ParticipationInclude>()({
  user: { include: userInclude },
  community: true,
  opportunity: { include: opportunityInclude },
});

export type PrismaParticipation = Prisma.ParticipationGetPayload<{
  include: typeof participationInclude;
}>;
