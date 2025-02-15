import { PrismaClientIssuer } from "@/prisma/client";
import { createUserLoader } from "@/graphql/dataloader/user";
import { createTransactionLoader } from "@/graphql/dataloader/transaction";
import { createOpportunityLoader } from "@/graphql/dataloader/opportunity";
import { createParticipationLoader } from "@/graphql/dataloader/opportunity/participation";
import { createWalletLoader } from "@/graphql/dataloader/membership/wallet";
import { createCommunityLoader } from "@/graphql/dataloader/community";
import { createMembershipLoader } from "@/graphql/dataloader/membership";
import { createUtilityLoader } from "@/graphql/dataloader/utility";
import { createPlaceLoader } from "@/graphql/dataloader/place";
import { createOpportunitySlotLoader } from "@/graphql/dataloader/opportunity/slot";
import { createParticipationStatusHistoryLoader } from "@/graphql/dataloader/opportunity/participation/status-history";

export function createLoaders(issuer: PrismaClientIssuer) {
  return {
    user: createUserLoader(issuer),
    community: createCommunityLoader(issuer),

    membership: createMembershipLoader(issuer),
    wallet: createWalletLoader(issuer),

    opportunity: createOpportunityLoader(issuer),
    opportunitySlot: createOpportunitySlotLoader(issuer),

    participation: createParticipationLoader(issuer),
    participationStatusHistory: createParticipationStatusHistoryLoader(issuer),

    transaction: createTransactionLoader(issuer),
    utility: createUtilityLoader(issuer),

    place: createPlaceLoader(issuer),
  };
}

export type Loaders = ReturnType<typeof createLoaders>;
