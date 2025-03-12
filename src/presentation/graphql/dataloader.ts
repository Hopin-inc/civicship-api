import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { createUserLoader } from "@/application/user/controller/dataloader";
import { createTransactionLoader } from "@/application/transaction/controller/dataloader";
import { createOpportunityLoader } from "@/application/opportunity/controller/dataloader";
import { createParticipationLoader } from "@/application/participation/controller/dataloader";
import { createWalletLoader } from "@/application/membership/wallet/controller/dataloader";
import { createCommunityLoader } from "@/application/community/controller/dataloader";
import { createMembershipLoader } from "@/application/membership/controller/dataloader";
import { createUtilityLoader } from "@/application/utility/controller/dataloader";
import { createPlaceLoader } from "@/application/place/controller/dataloader";
import { createOpportunitySlotLoader } from "@/application/opportunitySlot/controller/dataloader";
import { createParticipationStatusHistoryLoader } from "@/application/participation/statusHistory/controller/dataloader";
import { createOpportunityInvitationLoader } from "@/application/opportunityInvitation/controller/dataloader";
import { createOpportunityInvitationHistoryLoader } from "@/application/opportunityInvitation/invitationHistory/controller/dataloader";
import { createArticleLoader } from "@/application/article/controller/dataloader";
import { createTicketLoader } from "@/application/ticket/controller/dataloader";
import { createTicketStatusHistoryLoader } from "@/application/ticket/statusHistory/controller/dataloader";

export function createLoaders(issuer: PrismaClientIssuer) {
  return {
    user: createUserLoader(issuer),
    community: createCommunityLoader(issuer),

    membership: createMembershipLoader(issuer),
    wallet: createWalletLoader(issuer),

    opportunity: createOpportunityLoader(issuer),
    opportunitySlot: createOpportunitySlotLoader(issuer),

    opportunityInvitation: createOpportunityInvitationLoader(issuer),
    opportunityInvitationHistory: createOpportunityInvitationHistoryLoader(issuer),

    participation: createParticipationLoader(issuer),
    participationStatusHistory: createParticipationStatusHistoryLoader(issuer),

    utility: createUtilityLoader(issuer),
    ticket: createTicketLoader(issuer),
    ticketStatusHistory: createTicketStatusHistoryLoader(issuer),

    place: createPlaceLoader(issuer),
    article: createArticleLoader(issuer),

    transaction: createTransactionLoader(issuer),
  };
}

export type Loaders = ReturnType<typeof createLoaders>;
