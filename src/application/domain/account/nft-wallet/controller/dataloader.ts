import NftWalletPresenter from "@/application/domain/account/nft-wallet/presenter";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import DataLoader from "dataloader";
import { nftWalletSelectDetail } from "@/application/domain/account/nft-wallet/data/type";

type NftWalletWithoutUser = {
    __typename: "NftWallet";
    id: string;
    walletAddress: string;
    createdAt: Date;
    updatedAt: Date | null;
};

export function createNftWalletByUserIdLoader(issuer: PrismaClientIssuer) {
    return new DataLoader<string, NftWalletWithoutUser | null>(async (userIds) => {
        const records = await issuer.internal((tx) =>
            tx.nftWallet.findMany({
                where: { userId: { in: [...userIds] } },
                select: nftWalletSelectDetail,
            }),
        );

        const map = new Map<string, NftWalletWithoutUser>();
        for (const record of records) {
            map.set(record.userId, NftWalletPresenter.get(record));
        }

        return userIds.map((userId) => map.get(userId) ?? null);
    });
}
