import logger from "../../../../src/infrastructure/logging";
import { SyncResult, SyncProcessingResult } from "../types";

export function aggregateResults(results: SyncResult[]): SyncProcessingResult {
  const processing: SyncProcessingResult = {
    success: [],
    noWallet: [],
    apiFailed: [],
    dbFailed: [],
  };

  for (const result of results) {
    switch (result.kind) {
      case "success":
        processing.success.push(result);
        break;
      case "noWallet":
        processing.noWallet.push(result);
        break;
      case "apiFailed":
        processing.apiFailed.push(result);
        break;
      case "dbFailed":
        processing.dbFailed.push(result);
        break;
    }
  }

  return processing;
}

export function printSummary(processing: SyncProcessingResult, totalWallets: number): void {
  const totalNfts = processing.success.reduce((sum, r) => sum + r.nftCount, 0);
  const totalSynced = processing.success.reduce((sum, r) => sum + r.syncedCount, 0);

  logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  logger.info("Sync Summary:");
  logger.info(`  Total INTERNAL wallets: ${totalWallets}`);
  logger.info(`  Successfully synced: ${processing.success.length}`);
  logger.info(`  Total NFTs found: ${totalNfts}`);
  logger.info(`  Total NFT instances synced: ${totalSynced}`);
  logger.info(`  API failures: ${processing.apiFailed.length}`);
  logger.info(`  DB failures: ${processing.dbFailed.length}`);
  logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}
