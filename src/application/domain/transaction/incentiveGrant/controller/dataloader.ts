import { PrismaClient } from "@prisma/client";
import { incentiveGrantSelect, PrismaIncentiveGrant } from "../data/type";
import IncentiveGrantPresenter from "../presenter";
import { createLoaderById } from "@/presentation/graphql/dataloader/utils";

// Note: GraphQL types will be generated after running `pnpm gql:generate`
// Using 'any' temporarily until types are available
type GqlIncentiveGrant = any;

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
