import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
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

export function createWalletLoader(issuer: PrismaClientIssuer) {
  return createLoaderById<PrismaWalletDetail, GqlWallet>(async (ids) => {
    return issuer.internal((tx) =>
      tx.wallet.findMany({
        where: { id: { in: [...ids] } },
        select: walletSelectDetail,
      }),
    );
  }, WalletPresenter.get);
}

export function createWalletsByUserLoader(issuer: PrismaClientIssuer) {
  return createHasManyLoaderByKey<"userId", PrismaWalletDetail, GqlWallet>(
    "userId",
    async (userIds) => {
      return issuer.internal((tx) =>
        tx.wallet.findMany({
          where: {
            userId: { in: [...userIds] },
          },
          include: { currentPointView: true },
        }),
      );
    },
    WalletPresenter.get,
  );
}

export function createWalletsByCommunityLoader(issuer: PrismaClientIssuer) {
  return createHasManyLoaderByKey<"communityId", PrismaWalletDetail, GqlWallet>(
    "communityId",
    async (communityIds) => {
      return issuer.internal((tx) =>
        tx.wallet.findMany({
          where: { communityId: { in: [...communityIds] } },
          include: { currentPointView: true },
        }),
      );
    },
    WalletPresenter.get,
  );
}
