import { Prisma } from "@prisma/client";
import { opportunityInclude } from "@/application/opportunity/infrastructure/type";
import { userInclude } from "@/application/user/infrastructure/type";
import { communityInclude } from "@/application/community/infrastructure/type";

export const participationInclude = Prisma.validator<Prisma.ParticipationInclude>()({
  user: { include: userInclude },
  community: { include: communityInclude },
  opportunity: { include: opportunityInclude },
});

export type ParticipationPayloadWithArgs = Prisma.ParticipationGetPayload<{
  include: typeof participationInclude;
}>;
