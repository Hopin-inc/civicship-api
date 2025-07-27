import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";
import { injectable, inject } from "tsyringe";
import { fetchData } from "@/utils/fetch";
import logger from "@/infrastructure/logging";
import NFTWalletRepository from "@/application/domain/account/nft-wallet/data/repository";
import { BaseSepoliaNftResponse, BaseSepoliaTokenResponse } from "@/types/external/baseSepolia";

@injectable()
export default class NFTWalletService {
  constructor(
    @inject("NFTWalletRepository") private nftWalletRepository: NFTWalletRepository,
  ) {}
  async createOrUpdateWalletAddress(
    ctx: IContext,
    userId: string,
    walletAddress: string,
    tx: Prisma.TransactionClient,
  ) {
    return this.nftWalletRepository.upsertByUserId(ctx, userId, walletAddress, tx);
  }

  async findWalletByUserId(
    ctx: IContext,
    userId: string,
    tx?: Prisma.TransactionClient,
  ) {
    if (tx) {
      return this.nftWalletRepository.findByUserIdWithTx(ctx, userId, tx);
    }

    return this.nftWalletRepository.findByUserId(ctx, userId);
  }

  async storeMetadata(
    ctx: IContext,
    wallet: { id: string; walletAddress: string },
    tx: Prisma.TransactionClient,
  ): Promise<{ success: boolean; itemsProcessed: number; error?: string }> {
    try {
      logger.info(`🔄 Processing wallet: ${wallet.walletAddress}`);

      const baseApiUrl = process.env.BASE_SEPOLIA_API_URL || 'https://base-sepolia.blockscout.com/api/v2';
      const apiUrl = `${baseApiUrl}/addresses/${wallet.walletAddress}/nft`;
      const response = await fetchData<BaseSepoliaNftResponse>(apiUrl);

      if (!response.items || response.items.length === 0) {
        logger.info(`📭 No NFTs found for wallet: ${wallet.walletAddress}`);
        return { success: true, itemsProcessed: 0 };
      }

      for (const item of response.items) {
        let tokenInfo: BaseSepoliaTokenResponse | null = null;
        try {
          const tokenApiUrl = `${baseApiUrl}/tokens/${item.token.address}`;
          tokenInfo = await fetchData<BaseSepoliaTokenResponse>(tokenApiUrl);
          logger.info(`🔄 Fetched latest token info for: ${item.token.address}`);
        } catch (tokenError) {
          logger.warn(`⚠️ Failed to fetch token info for ${item.token.address}:`, tokenError);
        }

        const tokenName = tokenInfo?.name || item.token.name;
        const tokenSymbol = tokenInfo?.symbol || item.token.symbol;
        const tokenType = tokenInfo?.type || item.token.type || "UNKNOWN";

        const nftToken = await this.nftWalletRepository.upsertNftToken(ctx, {
          address: item.token.address,
          name: tokenName || null,
          symbol: tokenSymbol || null,
          type: tokenType,
          json: tokenInfo || item.token,
        }, tx);

        await this.nftWalletRepository.upsertNftInstance(ctx, {
          instanceId: item.id,
          name: item.metadata.name || null,
          description: item.metadata.description || null,
          imageUrl: item.metadata.image || null,
          json: item,
          nftWalletId: wallet.id,
          nftTokenId: nftToken.id,
        }, tx);
      }

      logger.info(`✅ Processed ${response.items.length} NFTs for wallet: ${wallet.walletAddress}`);
      return { success: true, itemsProcessed: response.items.length };
    } catch (error) {
      logger.error(`❌ Error processing wallet ${wallet.walletAddress}:`, error);
      return { success: false, itemsProcessed: 0, error: error instanceof Error ? error.message : String(error) };
    }
  }
}
