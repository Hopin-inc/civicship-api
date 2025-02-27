import { Prisma } from "@prisma/client";
import { opportunityInclude } from "@/infra/prisma/types/opportunity";

export const participationInclude = Prisma.validator<Prisma.ParticipationInclude>()({
  user: true,
  community: true,
  // community: {
  //   include: { city: { include: { state: true } } },
  // },
  opportunity: {
    include: opportunityInclude,
  },
});

export type ParticipationPayloadWithArgs = Prisma.ParticipationGetPayload<{
  include: typeof participationInclude;
}>;
