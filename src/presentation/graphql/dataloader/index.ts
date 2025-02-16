import { PrismaClientIssuer } from "@/infra/prisma/client";
import { createUserLoader } from "@/presentation/graphql/dataloader/user";
import { createTransactionLoader } from "@/presentation/graphql/dataloader/transaction";
import { createOpportunityLoader } from "@/presentation/graphql/dataloader/opportunity";
import { createParticipationLoader } from "@/presentation/graphql/dataloader/opportunity/participation";
import { createWalletLoader } from "@/presentation/graphql/dataloader/membership/wallet";
import { createCommunityLoader } from "@/presentation/graphql/dataloader/community";
import { createMembershipLoader } from "@/presentation/graphql/dataloader/membership";
import { createUtilityLoader } from "@/presentation/graphql/dataloader/utility";
import { createPlaceLoader } from "@/presentation/graphql/dataloader/place";
import { createOpportunitySlotLoader } from "@/presentation/graphql/dataloader/opportunity/slot";
import { createParticipationStatusHistoryLoader } from "@/presentation/graphql/dataloader/opportunity/participation/status-history";
import { createOpportunityInvitationLoader } from "@/presentation/graphql/dataloader/opportunity/invitation";
import { createOpportunityInvitationHistoryLoader } from "@/presentation/graphql/dataloader/opportunity/invitation/history";
import { createUtilityHistoryLoader } from "@/presentation/graphql/dataloader/utility/history";

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
    utilityHistory: createUtilityHistoryLoader(issuer),

    place: createPlaceLoader(issuer),
  };
}

export type Loaders = ReturnType<typeof createLoaders>;
