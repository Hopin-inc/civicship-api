import { PrismaClientIssuer } from "@/infra/prisma/client";
import { createUserLoader } from "@/presen/graphql/dataloader/user";
import { createTransactionLoader } from "@/presen/graphql/dataloader/transaction";
import { createOpportunityLoader } from "@/presen/graphql/dataloader/opportunity";
import { createParticipationLoader } from "@/presen/graphql/dataloader/opportunity/participation";
import { createWalletLoader } from "@/presen/graphql/dataloader/membership/wallet";
import { createCommunityLoader } from "@/presen/graphql/dataloader/community";
import { createMembershipLoader } from "@/presen/graphql/dataloader/membership";
import { createUtilityLoader } from "@/presen/graphql/dataloader/utility";
import { createPlaceLoader } from "@/presen/graphql/dataloader/place";
import { createOpportunitySlotLoader } from "@/presen/graphql/dataloader/opportunity/slot";
import { createParticipationStatusHistoryLoader } from "@/presen/graphql/dataloader/opportunity/participation/status-history";
import { createOpportunityInvitationLoader } from "@/presen/graphql/dataloader/opportunity/invitation";
import { createOpportunityInvitationHistoryLoader } from "@/presen/graphql/dataloader/opportunity/invitation/history";

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

    transaction: createTransactionLoader(issuer),
    utility: createUtilityLoader(issuer),

    place: createPlaceLoader(issuer),
  };
}

export type Loaders = ReturnType<typeof createLoaders>;
