import { IContext } from "@/types/server";
import { injectable, inject } from "tsyringe";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import NFTWalletService from "@/application/domain/account/nft-wallet/service";
import logger from "@/infrastructure/logging";

export type SyncMetadataResult = {
  success: boolean;
  itemsProcessed: number;
  error?: string;
};

export type RegisterWalletResult = {
  id: string;
  walletAddress: string;
  userId: string;
};

@injectable()
export default class NFTWalletUsecase {
  constructor(
    @inject("PrismaClientIssuer") private issuer: PrismaClientIssuer,
    @inject("NFTWalletService") private nftWalletService: NFTWalletService,
  ) {}

  async registerWallet(
    ctx: IContext,
    userId: string,
    walletAddress: string,
    userName?: string,
    currentUserName?: string,
  ): Promise<RegisterWalletResult> {
    return await this.issuer.public(ctx, async (tx) => {
      const wallet = await this.nftWalletService.createOrUpdateWalletAddress(
        ctx,
        userId,
        walletAddress,
        tx,
      );

      if (userName && currentUserName === "名前未設定") {
        await tx.user.update({
          where: { id: userId },
          data: { name: userName },
        });
        logger.info(`✅ Updated user name for user ${userId}: ${userName}`);
      }

      logger.info(`✅ Wallet registered for user ${userId}: ${walletAddress}`);
      
      return {
        id: wallet.id,
        walletAddress: wallet.walletAddress,
        userId: wallet.userId,
      };
    });
  }

  async syncMetadata(
    ctx: IContext,
    wallet: { id: string; walletAddress: string },
  ): Promise<SyncMetadataResult> {
    const startTime = Date.now();
    
    try {
      logger.info(`🔄 Fetching metadata for wallet: ${wallet.walletAddress}`);
      
      const metadata = await this.nftWalletService.fetchMetadata(wallet.walletAddress);
      
      if (metadata.items.length === 0) {
        logger.info(`📭 No NFTs found for wallet: ${wallet.walletAddress}`);
        return { success: true, itemsProcessed: 0 };
      }

      logger.debug(`📦 Fetched ${metadata.items.length} NFTs, fetching token info...`);

      const tokenInfos = await this.nftWalletService.fetchTokenInfos(ctx, metadata);

      logger.debug(`📥 Fetched token info for ${Object.keys(tokenInfos).length} tokens, persisting to DB...`);

      await this.issuer.internal(async (tx) => {
        await this.nftWalletService.persistMetadata(ctx, wallet, metadata, tokenInfos, tx);
      });

      const duration = Date.now() - startTime;
      logger.info(`✅ Stored ${metadata.items.length} NFTs for wallet: ${wallet.walletAddress} (${duration}ms)`);
      
      return { success: true, itemsProcessed: metadata.items.length };
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`❌ Error processing wallet ${wallet.walletAddress} after ${duration}ms:`, error);
      return {
        success: false,
        itemsProcessed: 0,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
