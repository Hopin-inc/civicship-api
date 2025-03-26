import { Prisma } from "@prisma/client";
import { opportunityInvitationInclude } from "@/application/domain/invitation/data/type";
import { participationInclude } from "@/application/domain/participation/data/type";

export const invitationHistoryInclude =
  Prisma.validator<Prisma.OpportunityInvitationHistoryInclude>()({
    invitation: { include: opportunityInvitationInclude },
    participations: { include: participationInclude },
  });

export type PrismaInvitationHistory = Prisma.OpportunityInvitationHistoryGetPayload<{
  include: typeof invitationHistoryInclude;
}>;
