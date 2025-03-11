import { Prisma } from "@prisma/client";
import { opportunityInclude } from "@/application/opportunity/data/type";
import { userInclude } from "@/application/user/data/type";
import { communityInclude } from "@/application/community/data/type";

export const participationInclude = Prisma.validator<Prisma.ParticipationInclude>()({
  user: { include: userInclude },
  community: { include: communityInclude },
  opportunity: { include: opportunityInclude },
});

export type ParticipationPayloadWithArgs = Prisma.ParticipationGetPayload<{
  include: typeof participationInclude;
}>;
