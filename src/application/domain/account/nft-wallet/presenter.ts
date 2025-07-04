import { PrismaNftWalletDetail } from "./data/type";

export default class NftWalletPresenter {
    static get(nftWallet: PrismaNftWalletDetail) {
        return {
            id: nftWallet.id,
            walletAddress: nftWallet.walletAddress,
            createdAt: nftWallet.createdAt,
            updatedAt: nftWallet.updatedAt,
        };
    }
}