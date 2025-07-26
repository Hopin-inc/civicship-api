import "reflect-metadata";
import "@/application/provider";
import logger from "@/infrastructure/logging";
import { container } from "tsyringe";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import NFTWalletService from "@/application/domain/account/nft-wallet/service";
import { IContext } from "@/types/server";

export async function syncNftMetadata() {
  logger.info("🚀 Starting NFT metadata synchronization batch");

  const issuer = container.resolve<PrismaClientIssuer>("PrismaClientIssuer");
  const nftWalletService = container.resolve<NFTWalletService>("NFTWalletService");
  const ctx = { issuer } as IContext;

  try {
    const nftWallets = await issuer.internal(async (tx) => {
      return tx.nftWallet.findMany({
        select: {
          id: true,
          walletAddress: true,
        },
      });
    });

    logger.info(`📦 Found ${nftWallets.length} NFT wallets to process`);

    let totalProcessed = 0;
    let totalErrors = 0;

    for (const wallet of nftWallets) {
      await issuer.internal(async (tx) => {
        const result = await nftWalletService.processMetadata(ctx, wallet, tx);
        if (result.success) {
          totalProcessed++;
        } else {
          totalErrors++;
        }
      });
    }

    logger.info(`🎯 NFT metadata sync completed: ${totalProcessed} wallets processed, ${totalErrors} errors`);
  } catch (error) {
    logger.error("💥 Batch process error:", error);
  }
}
