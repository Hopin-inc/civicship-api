import { Prisma } from "@prisma/client";

export const opportunityInvitationInclude = Prisma.validator<Prisma.OpportunityInvitationInclude>()(
  {
    opportunity: true,
    createdByUser: true,
  },
);

export type PrismaOpportunityInvitation = Prisma.OpportunityInvitationGetPayload<{
  include: typeof opportunityInvitationInclude;
}>;
