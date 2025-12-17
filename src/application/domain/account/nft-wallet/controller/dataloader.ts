import NftWalletPresenter from "@/application/domain/account/nft-wallet/presenter";
import { PrismaClient } from "@prisma/client";
import DataLoader from "dataloader";
import { nftWalletSelectDetail } from "@/application/domain/account/nft-wallet/data/type";

type NftWalletWithoutUser = {
    __typename: "NftWallet";
    id: string;
    walletAddress: string;
    createdAt: Date;
    updatedAt: Date | null;
};

export function createNftWalletByUserIdLoader(prisma: PrismaClient) {
    return new DataLoader<string, NftWalletWithoutUser | null>(async (userIds) => {
        const records = await prisma.nftWallet.findMany({
            where: { userId: { in: [...userIds] } },
            select: nftWalletSelectDetail,
        });

        const map = new Map<string, NftWalletWithoutUser>();
        for (const record of records) {
            map.set(record.userId, NftWalletPresenter.get(record));
        }

        return userIds.map((userId) => map.get(userId) ?? null);
    });
}
