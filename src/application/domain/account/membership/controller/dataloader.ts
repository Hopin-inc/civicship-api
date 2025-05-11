import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
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

export function createMembershipLoader(issuer: PrismaClientIssuer) {
  return createLoaderByCompositeKey<MembershipKey, PrismaMembershipDetail, GqlMembership>(
    async (keys) => {
      return issuer.internal((tx) =>
        tx.membership.findMany({
          where: {
            OR: keys.map(({ userId, communityId }) => ({
              userId,
              communityId,
            })),
          },
          select: membershipSelectDetail,
        }),
      );
    },
    (record) => ({
      userId: record.userId,
      communityId: record.communityId,
    }),
    MembershipPresenter.get,
  );
}

export function createMembershipsByUserLoader(issuer: PrismaClientIssuer) {
  return createHasManyLoaderByKey<"userId", PrismaMembershipDetail, GqlMembership>(
    "userId",
    async (userIds) => {
      return issuer.internal((tx) =>
        tx.membership.findMany({
          where: {
            userId: { in: [...userIds] },
          },
          include: {
            participationGeoViews: true,
            participationCountViews: true,
          },
        }),
      );
    },
    MembershipPresenter.get,
  );
}

export function createMembershipsByCommunityLoader(issuer: PrismaClientIssuer) {
  return createHasManyLoaderByKey<"communityId", PrismaMembershipDetail, GqlMembership>(
    "communityId",
    async (communityIds) => {
      return issuer.internal((tx) =>
        tx.membership.findMany({
          where: { communityId: { in: [...communityIds] } },
          include: {
            participationGeoViews: true,
            participationCountViews: true,
          },
        }),
      );
    },
    MembershipPresenter.get,
  );
}
