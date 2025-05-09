import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import * as UserLoaders from "@/application/domain/account/user/controller/dataloader";
import * as WalletLoaders from "@/application/domain/account/wallet/controller/dataloader";
import * as CommunityLoaders from "@/application/domain/account/community/controller/dataloader";
import * as MembershipLoaders from "@/application/domain/account/membership/controller/dataloader";
import * as IdentityLoaders from "@/application/domain/account/identity/controller/dataloader";
import * as MembershipHistoryLoaders from "@/application/domain/account/membership/history/controller/dataloader";

export function createAccountLoaders(issuer: PrismaClientIssuer) {
  return {
    user: UserLoaders.createUserLoader(issuer),
    authorsByArticle: UserLoaders.createAuthorsByArticleLoader(issuer),
    relatedUsersByArticle: UserLoaders.createRelatedUsersByArticleLoader(issuer),

    identity: IdentityLoaders.createIdentityLoader(issuer),
    identitiesByUser: IdentityLoaders.createIdentitiesByUserLoader(issuer),

    community: CommunityLoaders.createCommunityLoader(issuer),

    wallet: WalletLoaders.createWalletLoader(issuer),
    walletsByUser: WalletLoaders.createWalletsByUserLoader(issuer),
    walletsByCommunity: WalletLoaders.createWalletsByCommunityLoader(issuer),

    membership: MembershipLoaders.createMembershipLoader(issuer),
    membershipsByUser: MembershipLoaders.createMembershipsByUserLoader(issuer),
    membershipsByCommunity: MembershipLoaders.createMembershipsByCommunityLoader(issuer),

    membershipHistoriesByUser:
      MembershipHistoryLoaders.createMembershipHistoriesCreatedByUserLoader(issuer),
    membershipHistoriesByMembership:
      MembershipHistoryLoaders.createMembershipStatusHistoriesByMembershipLoader(issuer),
  };
}
