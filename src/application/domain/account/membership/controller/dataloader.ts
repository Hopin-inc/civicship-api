import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { GqlMembership } from "@/types/graphql";
import MembershipOutputFormat from "@/application/domain/account/membership/presenter";
import {
  membershipSelectDetail,
  PrismaMembershipDetail,
} from "@/application/domain/account/membership/data/type";
import { createHasManyLoaderByKey } from "@/presentation/graphql/dataloader/utils";
import MembershipPresenter from "@/application/domain/account/membership/presenter";

async function batchMembershipsByCompositeKey(
  issuer: PrismaClientIssuer,
  keys: readonly string[],
): Promise<(GqlMembership | null)[]> {
  const pairs = keys.map((k) => {
    const [userId, communityId] = k.split(":");
    return { userId, communityId };
  });

  const records = await issuer.internal(async (tx) => {
    return tx.membership.findMany({
      where: {
        OR: pairs.map((p) => ({
          userId: p.userId,
          communityId: p.communityId,
        })),
      },
      select: membershipSelectDetail,
    });
  });

  const map = new Map<string, GqlMembership>();
  for (const record of records) {
    const key = `${record.userId}:${record.communityId}`;
    map.set(key, MembershipOutputFormat.get(record));
  }

  return keys.map((k) => map.get(k) ?? null);
}

export function createMembershipLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlMembership | null>((keys) =>
    batchMembershipsByCompositeKey(issuer, keys),
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
