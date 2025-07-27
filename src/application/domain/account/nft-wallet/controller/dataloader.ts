import { GqlNftWallet } from "@/types/graphql";
import NftWalletPresenter from "@/application/domain/account/nft-wallet/presenter";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import DataLoader from "dataloader";
import { nftWalletSelectDetail } from "@/application/domain/account/nft-wallet/data/type";

export function createNftWalletByUserIdLoader(issuer: PrismaClientIssuer) {
    return new DataLoader<string, GqlNftWallet | null>(async (userIds) => {
        const records = await issuer.internal((tx) =>
            tx.nftWallet.findMany({
                where: { userId: { in: [...userIds] } },
                select: nftWalletSelectDetail,
            }),
        );

        const map = new Map<string, GqlNftWallet>();
        for (const record of records) {
            map.set(record.userId, NftWalletPresenter.get(record));
        }

        return userIds.map((userId) => map.get(userId) ?? null);
    });
}
