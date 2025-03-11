import { Prisma } from "@prisma/client";
import { opportunityInvitationInclude } from "@/application/opportunityInvitation/data/type";
import { userInclude } from "@/application/user/data/type";

export const invitationHistoryInclude =
  Prisma.validator<Prisma.OpportunityInvitationHistoryInclude>()({
    invitation: { include: opportunityInvitationInclude },
    invitedUser: { include: userInclude },
  });

export type PrismaInvitationHistory = Prisma.OpportunityInvitationHistoryGetPayload<{
  include: typeof invitationHistoryInclude;
}>;
