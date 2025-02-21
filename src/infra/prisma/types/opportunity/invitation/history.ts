import { Prisma } from "@prisma/client";

export const invitationHistoryInclude =
  Prisma.validator<Prisma.OpportunityInvitationHistoryInclude>()({
    invitation: true,
    inivitedUser: true,
  });

export type InvitationHistoryPayloadWithArgs = Prisma.OpportunityInvitationHistoryGetPayload<{
  include: typeof invitationHistoryInclude;
}>;
