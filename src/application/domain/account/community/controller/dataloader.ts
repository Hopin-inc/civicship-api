import { PrismaClient } from "@prisma/client";
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
