import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { GqlWallet } from "@/types/graphql";
import {
  walletSelectDetail,
  PrismaWalletDetail,
} from "@/application/domain/account/wallet/data/type";
import WalletPresenter from "@/application/domain/account/wallet/presenter";
import { createHasManyLoaderByKey } from "@/presentation/graphql/dataloader/utils";

async function batchWalletsById(
  issuer: PrismaClientIssuer,
  walletIds: readonly string[],
): Promise<(GqlWallet | null)[]> {
  const records = (await issuer.internal(async (tx) => {
    return tx.wallet.findMany({
      where: { id: { in: [...walletIds] } },
      select: walletSelectDetail,
    });
  })) as PrismaWalletDetail[];

  const map = new Map(records.map((record) => [record.id, WalletPresenter.get(record)]));
  return walletIds.map((id) => map.get(id) ?? null);
}

export function createWalletLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlWallet | null>((keys) => batchWalletsById(issuer, keys));
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
