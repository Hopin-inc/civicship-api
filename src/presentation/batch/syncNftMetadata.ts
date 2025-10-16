import "reflect-metadata";
import "@/application/provider";
import logger from "@/infrastructure/logging";
import { container } from "tsyringe";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import NFTWalletUsecase from "@/application/domain/account/nft-wallet/usecase";
import { IContext } from "@/types/server";

export async function syncNftMetadata() {
  logger.info("🚀 Starting NFT metadata synchronization batch");

  const issuer = container.resolve<PrismaClientIssuer>("PrismaClientIssuer");
  const nftWalletUsecase = container.resolve<NFTWalletUsecase>("NFTWalletUsecase");
  const ctx = { issuer } as IContext;

  try {
    const BATCH_SIZE = 50;
    let skip = 0;
    let totalProcessed = 0;
    let totalErrors = 0;
    let totalSkipped = 0;
    let hasMore = true;

    while (hasMore) {
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

      logger.info(`📦 Processing batch ${Math.floor(skip / BATCH_SIZE) + 1}: ${nftWallets.length} wallets (skip: ${skip})`);

      for (const wallet of nftWallets) {
        const result = await nftWalletUsecase.syncMetadata(ctx, wallet);
        
        if (result.success) {
          if (result.itemsProcessed > 0) {
            totalProcessed++;
          } else {
            totalSkipped++;
          }
        } else {
          totalErrors++;
          logger.warn(`⚠️ Error processing wallet ${wallet.walletAddress}: ${result.error}`);
        }
      }

      skip += BATCH_SIZE;
      if (nftWallets.length < BATCH_SIZE) {
        hasMore = false;
      }
    }

    logger.info(`🎯 NFT metadata sync completed: ${totalProcessed} processed, ${totalSkipped} skipped (no NFTs), ${totalErrors} errors`);
  } catch (error) {
    logger.error("💥 Batch process error:", error);
  }
}
