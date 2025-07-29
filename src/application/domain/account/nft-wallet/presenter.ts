import { PrismaNftWalletDetail } from "@/application/domain/account/nft-wallet/data/type";

export default class NftWalletPresenter {
    static get(nftWallet: PrismaNftWalletDetail) {
        return {
            __typename: "NftWallet" as const,
            id: nftWallet.id,
            walletAddress: nftWallet.walletAddress,
            createdAt: nftWallet.createdAt,
            updatedAt: nftWallet.updatedAt,
        } as const;
    }
}
