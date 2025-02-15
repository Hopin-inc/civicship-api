import { PrismaClientIssuer } from "@/prisma/client";
import { createUserLoader } from "@/graphql/dataloader/user";
import { createTransactionLoader } from "@/graphql/dataloader/transaction";
import { createOpportunityLoader } from "@/graphql/dataloader/opportunity/opportunity";
import { createParticipationLoader } from "@/graphql/dataloader/opportunity/participant";
import { createWalletLoader } from "@/graphql/dataloader/membership/wallet";
import { createCommunityLoader } from "@/graphql/dataloader/community";
import { createMembershipLoader } from "@/graphql/dataloader/membership/membership";
import { createUtilityLoader } from "@/graphql/dataloader/utility";
import { createPlaceLoader } from "@/graphql/dataloader/place";

export function createLoaders(issuer: PrismaClientIssuer) {
  return {
    user: createUserLoader(issuer),
    community: createCommunityLoader(issuer),
    membership: createMembershipLoader(issuer),
    wallet: createWalletLoader(issuer),
    opportunity: createOpportunityLoader(issuer),
    participation: createParticipationLoader(issuer),
    transaction: createTransactionLoader(issuer),
    utility: createUtilityLoader(issuer),
    place: createPlaceLoader(issuer),
  };
}

export type Loaders = ReturnType<typeof createLoaders>;
