import { createHasManyLoaderByKey } from "@/presentation/graphql/dataloader/utils";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import MembershipHistoryPresenter from "@/application/domain/account/membership/history/persenter";
import { GqlMembershipHistory } from "@/types/graphql";
import {
  membershipHistoryInclude,
  PrismaMembershipHistory,
} from "@/application/domain/account/membership/history/data/type";

export function createMembershipHistoriesCreatedByUserLoader(issuer: PrismaClientIssuer) {
  return createHasManyLoaderByKey<"createdBy", PrismaMembershipHistory, GqlMembershipHistory>(
    "createdBy",
    async (userIds) => {
      return issuer.internal((tx) =>
        tx.membershipHistory.findMany({
          where: {
            createdBy: { in: [...userIds] },
          },
          include: membershipHistoryInclude,
        }),
      );
    },
    MembershipHistoryPresenter.get,
  );
}
