import { Prisma } from "@prisma/client";
import { opportunityInclude } from "@/infra/prisma/types/opportunity";
import { userInclude } from "@/infra/prisma/types/user";
import { communityInclude } from "@/infra/prisma/types/community";

export const participationInclude = Prisma.validator<Prisma.ParticipationInclude>()({
  user: { include: userInclude },
  community: { include: communityInclude },
  opportunity: { include: opportunityInclude },
});

export type ParticipationPayloadWithArgs = Prisma.ParticipationGetPayload<{
  include: typeof participationInclude;
}>;
