import logger from "@/infrastructure/logging";
import { NftMintResult } from "@/application/domain/reward/nft/nft-mint/data/type";

export default class NftMintLogger {
  startMint(orderItemId: string, nftWalletId: string, quantity: number) {
    logger.info("NFT mint started", { orderItemId, nftWalletId, quantity });
  }

  phase(phase: string, duration: number, details?: Record<string, unknown>) {
    logger.info(`NFT mint ${phase} completed`, { phase, duration, ...details });
  }

  success(orderItemId: string, results: NftMintResult[], totalDuration: number) {
    logger.info("NFT mint completed successfully", {
      orderItemId,
      count: results.length,
      totalDuration,
      results: results.map((r) => ({ mintId: r.mintId, status: r.status })),
    });
  }

  failure(orderItemId: string, error: unknown) {
    logger.error("NFT mint failed", {
      orderItemId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
