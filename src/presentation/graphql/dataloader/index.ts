import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { createAccountLoaders } from "@/presentation/graphql/dataloader/domain/account";
import { createExperienceLoaders } from "@/presentation/graphql/dataloader/domain/experience";
import { createRewardLoaders } from "@/presentation/graphql/dataloader/domain/reward";
import { createContentLoaders } from "@/presentation/graphql/dataloader/domain/content";
import { createTransactionLoaders } from "@/presentation/graphql/dataloader/domain/transaction";
import { createLocationLoaders } from "@/presentation/graphql/dataloader/domain/location";

export function createLoaders(issuer: PrismaClientIssuer) {
  return {
    ...createAccountLoaders(issuer),
    ...createExperienceLoaders(issuer),
    ...createRewardLoaders(issuer),
    ...createContentLoaders(issuer),
    ...createTransactionLoaders(issuer),
    ...createLocationLoaders(issuer),
  };
}

export type Loaders = ReturnType<typeof createLoaders>;
