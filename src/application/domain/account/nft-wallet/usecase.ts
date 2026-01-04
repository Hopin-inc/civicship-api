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
        logger.debug("✅ Updated user name", { userId, userName });
      }

      logger.debug("✅ Wallet registered", { userId, walletAddress });
      
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
      logger.debug("🔄 Starting NFT metadata sync", { walletAddress: wallet.walletAddress });
      
      const metadata = await this.nftWalletService.fetchMetadata(wallet.walletAddress);

      if (metadata.items.length === 0) {
        await this.issuer.internal(async (tx) => {
          await tx.nftWallet.update({
            where: { id: wallet.id },
            data: { updatedAt: new Date() }
          });
        });

        logger.debug("📭 No NFTs found for wallet", {
          walletAddress: wallet.walletAddress,
          durationMs: Date.now() - startTime,
        });
        return { success: true, itemsProcessed: 0 };
      }

      logger.debug("📦 Fetching token info", {
        walletAddress: wallet.walletAddress,
        nftCount: metadata.items.length,
      });

      const tokenInfos = await this.nftWalletService.fetchTokenInfos(ctx, metadata);

      logger.debug("📥 Persisting to database", { 
        walletAddress: wallet.walletAddress,
        tokenCount: Object.keys(tokenInfos).length,
      });

      await this.issuer.internal(async (tx) => {
        await this.nftWalletService.persistMetadata(ctx, wallet, metadata, tokenInfos, tx);

        await tx.nftWallet.update({
          where: { id: wallet.id },
          data: { updatedAt: new Date() }
        });
      });

      logger.debug("✅ NFT metadata sync completed", {
        walletAddress: wallet.walletAddress,
        itemsProcessed: metadata.items.length,
        durationMs: Date.now() - startTime,
      });
      
      return { success: true, itemsProcessed: metadata.items.length };
    } catch (error) {
      // Update updatedAt even on error to prevent infinite retry loop
      try {
        await this.issuer.internal(async (tx) => {
          await tx.nftWallet.update({
            where: { id: wallet.id },
            data: { updatedAt: new Date() }
          });
        });
      } catch (updateError) {
        logger.error("🚨 Failed to update wallet updatedAt on sync error", {
          walletAddress: wallet.walletAddress,
          originalErrorMessage: error instanceof Error ? error.message : JSON.stringify(error),
          updateErrorMessage: updateError instanceof Error ? updateError.message : JSON.stringify(updateError),
        });
      }

      const errorDetails = {
        walletAddress: wallet.walletAddress,
        durationMs: Date.now() - startTime,
        errorMessage: error instanceof Error ? error.message : JSON.stringify(error),
        errorName: error instanceof Error ? error.name : 'Unknown',
        errorCode: (error as any)?.code,
        errorType: (error as any)?.type,
        errorStack: error instanceof Error ? error.stack : undefined,
      };

      // Use warn level for timeout errors (temporary network issues)
      const isTimeout = !!error && (error as any).code === 'ETIMEDOUT';
      if (isTimeout) {
        logger.warn("⚠️ NFT metadata sync timeout", errorDetails);
      } else {
        logger.error("❌ NFT metadata sync failed", errorDetails);
      }

      return {
        success: false,
        itemsProcessed: 0,
        error: error instanceof Error ? error.message : JSON.stringify(error),
      };
    }
  }
}
