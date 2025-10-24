import "reflect-metadata";
import "@/application/provider";
import logger from "@/infrastructure/logging";
import { container } from "tsyringe";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import NFTWalletUsecase from "@/application/domain/account/nft-wallet/usecase";
import { IContext } from "@/types/server";

export async function syncNftMetadata() {
  const batchStartTime = Date.now();
  logger.info("🚀 Starting NFT metadata synchronization batch", { startTime: new Date().toISOString() });

  const issuer = container.resolve<PrismaClientIssuer>("PrismaClientIssuer");
  const nftWalletUsecase = container.resolve<NFTWalletUsecase>("NFTWalletUsecase");
  const ctx = { issuer } as IContext;

  try {
    const BATCH_SIZE = 50;
    let skip = 0;
    let totalProcessed = 0;
    let totalErrors = 0;
    let totalSkipped = 0;
    let totalNftsProcessed = 0;
    let hasMore = true;

    while (hasMore) {
      const batchIterationStartTime = Date.now();
      
      const nftWallets = await issuer.internal(async (tx) => {
        return tx.nftWallet.findMany({
          select: {
            id: true,
            walletAddress: true,
          },
          take: BATCH_SIZE,
          skip: skip,
        });
      });

      if (nftWallets.length === 0) {
        hasMore = false;
        break;
      }

      logger.info("📦 Processing batch", {
        batchNumber: Math.floor(skip / BATCH_SIZE) + 1,
        walletCount: nftWallets.length,
        skip,
      });

      for (const wallet of nftWallets) {
        const result = await nftWalletUsecase.syncMetadata(ctx, wallet);
        
        if (result.success) {
          if (result.itemsProcessed > 0) {
            totalProcessed++;
            totalNftsProcessed += result.itemsProcessed;
          } else {
            totalSkipped++;
          }
        } else {
          totalErrors++;
          logger.warn("⚠️ Wallet sync error", {
            walletAddress: wallet.walletAddress,
            error: result.error,
          });
        }
      }

      logger.info("✅ Batch iteration completed", {
        batchNumber: Math.floor(skip / BATCH_SIZE) + 1,
        durationMs: Date.now() - batchIterationStartTime,
      });

      skip += BATCH_SIZE;
      if (nftWallets.length < BATCH_SIZE) {
        hasMore = false;
      }
    }

    logger.info("🎯 NFT metadata sync completed", {
      totalWalletsProcessed: totalProcessed,
      totalWalletsSkipped: totalSkipped,
      totalWalletsErrors: totalErrors,
      totalNftsProcessed,
      durationMs: Date.now() - batchStartTime,
      endTime: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("💥 Batch process error", {
      durationMs: Date.now() - batchStartTime,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
