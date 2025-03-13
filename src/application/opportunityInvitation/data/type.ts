import { Prisma } from "@prisma/client";
import { opportunityInclude } from "@/application/opportunity/data/type";
import { userInclude } from "@/application/user/data/type";

export const opportunityInvitationAuthSelect =
  Prisma.validator<Prisma.OpportunityInvitationSelect>()({
    id: true,
  });

export const opportunityInvitationInclude = Prisma.validator<Prisma.OpportunityInvitationInclude>()(
  {
    opportunity: { include: opportunityInclude },
    createdByUser: { include: userInclude },
  },
);

export type PrismaOpportunityInvitation = Prisma.OpportunityInvitationGetPayload<{
  include: typeof opportunityInvitationInclude;
}>;
