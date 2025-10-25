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
    let totalEmptyWallets = 0;
    let totalNftsProcessed = 0;
    let totalFetchedFromDB = 0;
    let hasMore = true;

    while (hasMore) {
      const batchIterationStartTime = Date.now();
      
      const nftWallets = await issuer.internal(async (tx) => {
        return tx.nftWallet.findMany({
          where: {
            nftInstances: {
              none: {}
            }
          },
          select: {
            id: true,
            walletAddress: true,
          },
          orderBy: [
            { id: 'asc' }
          ],
          take: BATCH_SIZE,
          skip: skip,
        });
      });

      totalFetchedFromDB += nftWallets.length;

      if (nftWallets.length === 0) {
        hasMore = false;
        logger.info("✅ No more wallets to sync (all wallets have been synced at least once)");
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
            logger.info("✅ Wallet synced with NFTs", {
              walletAddress: wallet.walletAddress,
              nftCount: result.itemsProcessed,
            });
          } else {
            totalEmptyWallets++;
            logger.info("📭 Wallet synced (empty)", {
              walletAddress: wallet.walletAddress,
              note: "This wallet will be re-processed in future runs",
            });
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
        processedInIteration: nftWallets.length,
        durationMs: Date.now() - batchIterationStartTime,
      });

      skip += BATCH_SIZE;
      if (nftWallets.length < BATCH_SIZE) {
        hasMore = false;
      }
    }

    logger.info("🎯 NFT metadata sync completed", {
      totalFetchedFromDB,
      totalWalletsWithNFTs: totalProcessed,
      totalEmptyWallets,
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
