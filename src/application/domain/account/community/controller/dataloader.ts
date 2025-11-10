import DataLoader from "dataloader";
import { PrismaClient } from "@prisma/client";
import { GqlCommunityPointFlowStat } from "@/types/graphql";
import CommunityPresenter from "@/application/domain/account/community/presenter";
import { communitySelectDetail } from "@/application/domain/account/community/data/type";
import { createLoaderById } from "@/presentation/graphql/dataloader/utils";

export function createCommunityLoader(prisma: PrismaClient) {
  return createLoaderById(async (ids) => {
    return prisma.community.findMany({
      where: { id: { in: [...ids] } },
      select: communitySelectDetail,
    });
  }, CommunityPresenter.get);
}

export function createCommunityPointFlowStatLoader(prisma: PrismaClient) {
  return new DataLoader<string, GqlCommunityPointFlowStat | null>(async (communityIds) => {
    const records = await prisma.communityPointFlowStat.findMany({
      where: { communityId: { in: [...communityIds] } },
    });

    const map = new Map<string, GqlCommunityPointFlowStat>();
    for (const record of records) {
      map.set(record.communityId, {
        __typename: "CommunityPointFlowStat" as const,
        communityId: record.communityId,
        issuedPoints: record.issuedPoints,
        grantedPoints: record.grantedPoints,
        transferredPoints: record.transferredPoints,
        updatedAt: record.updatedAt,
      });
    }

    return communityIds.map((id) => map.get(id) ?? null);
  });
}
