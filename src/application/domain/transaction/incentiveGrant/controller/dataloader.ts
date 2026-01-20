import { PrismaClient } from "@prisma/client";
import { incentiveGrantSelect, PrismaIncentiveGrant } from "../data/type";
import IncentiveGrantPresenter from "../presenter";
import { createLoaderById } from "@/presentation/graphql/dataloader/utils";
import { GqlIncentiveGrant } from "@/types/graphql";

export function createIncentiveGrantLoader(prisma: PrismaClient) {
  return createLoaderById<PrismaIncentiveGrant, GqlIncentiveGrant>(
    async (ids) =>
      prisma.incentiveGrant.findMany({
        where: { id: { in: [...ids] } },
        select: incentiveGrantSelect,
      }),
    IncentiveGrantPresenter.get,
  );
}
