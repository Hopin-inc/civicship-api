import { PrismaClient } from "@prisma/client";
import { createAccountLoaders } from "@/presentation/graphql/dataloader/domain/account";
import { createExperienceLoaders } from "@/presentation/graphql/dataloader/domain/experience";
import { createRewardLoaders } from "@/presentation/graphql/dataloader/domain/reward";
import { createContentLoaders } from "@/presentation/graphql/dataloader/domain/content";
import { createTransactionLoaders } from "@/presentation/graphql/dataloader/domain/transaction";
import { createLocationLoaders } from "@/presentation/graphql/dataloader/domain/location";
import { createVoteLoaders } from "@/presentation/graphql/dataloader/domain/vote";
import { createReportLoaders } from "@/presentation/graphql/dataloader/domain/report";

export function createLoaders(prisma: PrismaClient) {
  return {
    ...createAccountLoaders(prisma),
    ...createExperienceLoaders(prisma),
    ...createRewardLoaders(prisma),
    ...createContentLoaders(prisma),
    ...createTransactionLoaders(prisma),
    ...createLocationLoaders(prisma),
    ...createVoteLoaders(prisma),
    ...createReportLoaders(prisma),
  };
}

export type Loaders = ReturnType<typeof createLoaders>;
