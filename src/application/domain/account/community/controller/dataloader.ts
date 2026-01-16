import { PrismaClient } from "@prisma/client";
import CommunityPresenter from "@/application/domain/account/community/presenter";
import { communitySelectDetail } from "@/application/domain/account/community/data/type";
import { createLoaderById } from "@/presentation/graphql/dataloader/utils";
import DataLoader from "dataloader";

export function createCommunityLoader(prisma: PrismaClient) {
  return createLoaderById(async (ids) => {
    return prisma.community.findMany({
      where: { id: { in: [...ids] } },
      select: communitySelectDetail,
    });
  }, CommunityPresenter.get);
}

export function createSignupBonusConfigByCommunityIdLoader(prisma: PrismaClient) {
  return new DataLoader(async (communityIds: readonly string[]) => {
    const configs = await prisma.communitySignupBonusConfig.findMany({
      where: { communityId: { in: [...communityIds] } },
    });

    const configMap = new Map(configs.map((c) => [c.communityId, c]));

    return communityIds.map((id) => configMap.get(id) || null);
  });
}
