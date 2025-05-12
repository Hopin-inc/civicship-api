import {
  createHasManyLoaderByKey,
  createLoaderByCompositeKey,
} from "@/presentation/graphql/dataloader/utils";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import MembershipHistoryPresenter from "@/application/domain/account/membership/history/persenter";
import { GqlMembershipHistory } from "@/types/graphql";
import {
  membershipHistoryInclude,
  PrismaMembershipHistory,
} from "@/application/domain/account/membership/history/data/type";

export function createMembershipHistoriesCreatedByUserLoader(issuer: PrismaClientIssuer) {
  return createHasManyLoaderByKey<"createdBy", PrismaMembershipHistory, GqlMembershipHistory>(
    "createdBy",
    async (userIds) => {
      return issuer.internal((tx) =>
        tx.membershipHistory.findMany({
          where: {
            createdBy: { in: [...userIds] },
          },
          include: membershipHistoryInclude,
        }),
      );
    },
    MembershipHistoryPresenter.get,
  );
}

export function createMembershipStatusHistoriesByMembershipLoader(issuer: PrismaClientIssuer) {
  return createLoaderByCompositeKey<
    { userId: string; communityId: string },
    PrismaMembershipHistory,
    GqlMembershipHistory
  >(
    async (keys) => {
      return issuer.internal((tx) =>
        tx.membershipHistory.findMany({
          where: {
            OR: keys.map((key) => ({
              userId: key.userId,
              communityId: key.communityId,
            })),
          },
          include: membershipHistoryInclude,
        }),
      );
    },
    (record) => ({ userId: record.userId, communityId: record.communityId }),
    MembershipHistoryPresenter.get,
  );
}
