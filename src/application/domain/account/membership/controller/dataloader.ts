import { PrismaClient } from "@prisma/client";
import { GqlMembership } from "@/types/graphql";
import {
  membershipSelectDetail,
  PrismaMembershipDetail,
} from "@/application/domain/account/membership/data/type";
import {
  createHasManyLoaderByKey,
  createLoaderByCompositeKey,
} from "@/presentation/graphql/dataloader/utils";
import MembershipPresenter from "@/application/domain/account/membership/presenter";

type MembershipKey = { userId: string; communityId: string };

export function createMembershipLoader(prisma: PrismaClient) {
  return createLoaderByCompositeKey<MembershipKey, PrismaMembershipDetail, GqlMembership>(
    async (keys) => {
      return prisma.membership.findMany({
        where: {
          OR: keys.map(({ userId, communityId }) => ({
            userId,
            communityId,
          })),
        },
        select: membershipSelectDetail,
      });
    },
    (record) => ({
      userId: record.userId,
      communityId: record.communityId,
    }),
    MembershipPresenter.get,
  );
}

export function createMembershipsByUserLoader(prisma: PrismaClient) {
  return createHasManyLoaderByKey<"userId", PrismaMembershipDetail, GqlMembership>(
    "userId",
    async (userIds) => {
      return prisma.membership.findMany({
        where: {
          userId: { in: [...userIds] },
        },
        select: membershipSelectDetail,
      });
    },
    MembershipPresenter.get,
  );
}

export function createMembershipsByCommunityLoader(prisma: PrismaClient) {
  return createHasManyLoaderByKey<"communityId", PrismaMembershipDetail, GqlMembership>(
    "communityId",
    async (communityIds) => {
      return prisma.membership.findMany({
        where: { communityId: { in: [...communityIds] } },
        select: membershipSelectDetail,
      });
    },
    MembershipPresenter.get,
  );
}
