import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import {
  nftWalletSelectDetail,
  PrismaNftWalletDetail,
} from "@/application/domain/account/nft-wallet/data/type";
import NftWalletPresenter from "@/application/domain/account/nft-wallet/presenter";
import DataLoader from "dataloader";

export function createNftWalletByUserIdLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, ReturnType<typeof NftWalletPresenter.get> | null>(async (userIds) => {
    const records = await issuer.internal((tx) =>
      tx.nftWallet.findMany({
        where: { userId: { in: [...userIds] } },
        select: nftWalletSelectDetail,
      }),
    ) as PrismaNftWalletDetail[];

    const map = new Map<string, ReturnType<typeof NftWalletPresenter.get>>();
    for (const record of records) {
      map.set(record.userId, NftWalletPresenter.get(record));
    }

    return userIds.map((userId) => map.get(userId) ?? null);
  });
}
