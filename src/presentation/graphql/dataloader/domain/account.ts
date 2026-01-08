import { PrismaClient } from "@prisma/client";
import * as UserLoaders from "@/application/domain/account/user/controller/dataloader";
import * as WalletLoaders from "@/application/domain/account/wallet/controller/dataloader";
import * as CommunityLoaders from "@/application/domain/account/community/controller/dataloader";
import * as MembershipLoaders from "@/application/domain/account/membership/controller/dataloader";
import * as IdentityLoaders from "@/application/domain/account/identity/controller/dataloader";
import * as MembershipHistoryLoaders from "@/application/domain/account/membership/history/controller/dataloader";
import { createDidIssuanceRequestsByUserIdLoader } from "@/application/domain/account/identity/didIssuanceRequest/controller/dataloader";
import { createNftWalletByUserIdLoader } from "@/application/domain/account/nft-wallet/controller/dataloader";
import * as NftInstanceLoaders from "@/application/domain/account/nft-instance/controller/dataloader";

export function createAccountLoaders(prisma: PrismaClient) {
  return {
    user: UserLoaders.createUserLoader(prisma),
    authorsByArticle: UserLoaders.createAuthorsByArticleLoader(prisma),
    relatedUsersByArticle: UserLoaders.createRelatedUsersByArticleLoader(prisma),

    identity: IdentityLoaders.createIdentityLoader(prisma),
    identitiesByUser: IdentityLoaders.createIdentitiesByUserLoader(prisma),

    didIssuanceRequestsByUser: createDidIssuanceRequestsByUserIdLoader(prisma),

    community: CommunityLoaders.createCommunityLoader(prisma),
    communityByNftInstance: NftInstanceLoaders.createCommunityLoaderByNftInstance(prisma),

    wallet: WalletLoaders.createWalletLoader(prisma),
    walletsByUser: WalletLoaders.createWalletsByUserLoader(prisma),
    walletsByCommunity: WalletLoaders.createWalletsByCommunityLoader(prisma),

    membership: MembershipLoaders.createMembershipLoader(prisma),
    membershipsByUser: MembershipLoaders.createMembershipsByUserLoader(prisma),
    membershipsByCommunity: MembershipLoaders.createMembershipsByCommunityLoader(prisma),

    membershipHistoriesByUser:
      MembershipHistoryLoaders.createMembershipHistoriesCreatedByUserLoader(prisma),
    membershipHistoriesByMembership:
      MembershipHistoryLoaders.createMembershipStatusHistoriesByMembershipLoader(prisma),

    nftWalletByUserId: createNftWalletByUserIdLoader(prisma),
  };
}
