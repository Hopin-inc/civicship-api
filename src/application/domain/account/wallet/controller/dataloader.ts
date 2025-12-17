import { PrismaClient } from "@prisma/client";
import { GqlWallet } from "@/types/graphql";
import {
  walletSelectDetail,
  PrismaWalletDetail,
} from "@/application/domain/account/wallet/data/type";
import WalletPresenter from "@/application/domain/account/wallet/presenter";
import {
  createHasManyLoaderByKey,
  createLoaderById,
} from "@/presentation/graphql/dataloader/utils";

export function createWalletLoader(prisma: PrismaClient) {
  return createLoaderById<PrismaWalletDetail, GqlWallet>(async (ids) => {
    return prisma.wallet.findMany({
      where: { id: { in: [...ids] } },
      select: walletSelectDetail,
    });
  }, WalletPresenter.get);
}

export function createWalletsByUserLoader(prisma: PrismaClient) {
  return createHasManyLoaderByKey<"userId", PrismaWalletDetail, GqlWallet>(
    "userId",
    async (userIds) => {
      return prisma.wallet.findMany({
        where: {
          userId: { in: [...userIds] },
        },
        include: { currentPointView: true },
      });
    },
    WalletPresenter.get,
  );
}

export function createWalletsByCommunityLoader(prisma: PrismaClient) {
  return createHasManyLoaderByKey<"communityId", PrismaWalletDetail, GqlWallet>(
    "communityId",
    async (communityIds) => {
      return prisma.wallet.findMany({
        where: { communityId: { in: [...communityIds] } },
        include: { currentPointView: true },
      });
    },
    WalletPresenter.get,
  );
}
