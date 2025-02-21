import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infra/prisma/client";
import { GqlWallet } from "@/types/graphql";
import WalletOutputFormat from "@/presentation/graphql/dto/membership/wallet/output";
import { walletInclude } from "@/infra/prisma/types/membership/wallet";

async function batchWalletsById(
  issuer: PrismaClientIssuer,
  walletIds: readonly string[],
): Promise<(GqlWallet | null)[]> {
  const records = await issuer.internal(async (tx) => {
    return tx.wallet.findMany({
      where: { id: { in: [...walletIds] } },
      include: walletInclude, // ウォレットに関連するjoinが必要なら
    });
  });

  const map = new Map(records.map((record) => [record.id, WalletOutputFormat.get(record)]));
  return walletIds.map((id) => map.get(id) ?? null);
}

export function createWalletLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlWallet | null>((keys) => batchWalletsById(issuer, keys));
}
