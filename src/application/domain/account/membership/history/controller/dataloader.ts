import {
  createHasManyLoaderByKey,
  createLoaderByCompositeKey,
} from "@/presentation/graphql/dataloader/utils";
import { PrismaClient } from "@prisma/client";
import MembershipHistoryPresenter from "@/application/domain/account/membership/history/persenter";
import { GqlMembershipHistory } from "@/types/graphql";
import {
  membershipHistoryInclude,
  PrismaMembershipHistory,
} from "@/application/domain/account/membership/history/data/type";

export function createMembershipHistoriesCreatedByUserLoader(prisma: PrismaClient) {
  return createHasManyLoaderByKey<"createdBy", PrismaMembershipHistory, GqlMembershipHistory>(
    "createdBy",
    async (userIds) => {
      return prisma.membershipHistory.findMany({
        where: {
          createdBy: { in: [...userIds] },
        },
        include: membershipHistoryInclude,
      });
    },
    MembershipHistoryPresenter.get,
  );
}

export function createMembershipStatusHistoriesByMembershipLoader(prisma: PrismaClient) {
  return createLoaderByCompositeKey<
    { userId: string; communityId: string },
    PrismaMembershipHistory,
    GqlMembershipHistory
  >(
    async (keys) => {
      return prisma.membershipHistory.findMany({
        where: {
          OR: keys.map((key) => ({
            userId: key.userId,
            communityId: key.communityId,
          })),
        },
        include: membershipHistoryInclude,
      });
    },
    (record) => ({ userId: record.userId, communityId: record.communityId }),
    MembershipHistoryPresenter.get,
  );
}
