import { Prisma } from "@prisma/client";
import { opportunityInclude } from "@/infrastructure/prisma/types/opportunity";
import { userInclude } from "@/infrastructure/prisma/types/user";
import { communityInclude } from "@/infrastructure/prisma/types/community";

export const participationInclude = Prisma.validator<Prisma.ParticipationInclude>()({
  user: { include: userInclude },
  community: { include: communityInclude },
  opportunity: { include: opportunityInclude },
});

export type ParticipationPayloadWithArgs = Prisma.ParticipationGetPayload<{
  include: typeof participationInclude;
}>;
