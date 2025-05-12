import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import CommunityPresenter from "@/application/domain/account/community/presenter";
import { communitySelectDetail } from "@/application/domain/account/community/data/type";
import { createLoaderById } from "@/presentation/graphql/dataloader/utils";

export function createCommunityLoader(issuer: PrismaClientIssuer) {
  return createLoaderById(async (ids) => {
    return issuer.internal((tx) =>
      tx.community.findMany({
        where: { id: { in: [...ids] } },
        select: communitySelectDetail,
      }),
    );
  }, CommunityPresenter.get);
}
