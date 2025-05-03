import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { GqlWallet } from "@/types/graphql";
import WalletOutputFormat from "@/application/domain/account/wallet/presenter";
import { walletSelectDetail, PrismaWalletDetail } from "@/application/domain/account/wallet/data/type";

async function batchWalletsById(
  issuer: PrismaClientIssuer,
  walletIds: readonly string[],
): Promise<(GqlWallet | null)[]> {
  const records = await issuer.internal(async (tx) => {
    return tx.wallet.findMany({
      where: { id: { in: [...walletIds] } },
      select: walletSelectDetail,
    });
  }) as PrismaWalletDetail[];

  const map = new Map(records.map((record) => [record.id, WalletOutputFormat.get(record)]));
  return walletIds.map((id) => map.get(id) ?? null);
}

export function createWalletLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlWallet | null>((keys) => batchWalletsById(issuer, keys));
}
