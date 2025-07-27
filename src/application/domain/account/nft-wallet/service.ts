import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";
import { injectable, inject } from "tsyringe";
import { fetchData } from "@/utils/fetch";
import logger from "@/infrastructure/logging";
import NFTWalletRepository from "@/application/domain/account/nft-wallet/data/repository";

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
      return tx.nftWallet.findUnique({
        where: { userId },
      });
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

      const apiUrl = `https://base-sepolia.blockscout.com/api/v2/addresses/${wallet.walletAddress}/nft`;
      const response = await fetchData<BaseSepoliaNftResponse>(apiUrl);

      if (!response.items || response.items.length === 0) {
        logger.info(`📭 No NFTs found for wallet: ${wallet.walletAddress}`);
        return { success: true, itemsProcessed: 0 };
      }

      for (const item of response.items) {
        const nftToken = await tx.nftToken.upsert({
          where: { address: item.token.address },
          update: {
            name: item.token.name,
            symbol: item.token.symbol,
            type: item.token.type,
          },
          create: {
            address: item.token.address,
            name: item.token.name,
            symbol: item.token.symbol,
            type: item.token.type,
          },
        });

        await tx.nftInstance.upsert({
          where: {
            nftWalletId_instanceId: {
              nftWalletId: wallet.id,
              instanceId: item.id,
            },
          },
          update: {
            name: item.metadata.name,
            description: item.metadata.description,
            imageUrl: item.metadata.image,
            json: item,
            nftTokenId: nftToken.id,
          },
          create: {
            instanceId: item.id,
            name: item.metadata.name,
            description: item.metadata.description,
            imageUrl: item.metadata.image,
            json: item,
            nftWalletId: wallet.id,
            nftTokenId: nftToken.id,
          },
        });
      }

      logger.info(`✅ Processed ${response.items.length} NFTs for wallet: ${wallet.walletAddress}`);
      return { success: true, itemsProcessed: response.items.length };
    } catch (error) {
      logger.error(`❌ Error processing wallet ${wallet.walletAddress}:`, error);
      return { success: false, itemsProcessed: 0, error: error instanceof Error ? error.message : String(error) };
    }
  }
}

interface BaseSepoliaNftItem {
  id: string;
  metadata: {
    name?: string;
    description?: string;
    image?: string;
  };
  token: {
    address: string;
    name?: string;
    symbol?: string;
    type: string;
  };
}

interface BaseSepoliaNftResponse {
  items: BaseSepoliaNftItem[];
  next_page_params: Record<string, unknown> | null;
}
