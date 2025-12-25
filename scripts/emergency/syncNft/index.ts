import "reflect-metadata";
import "@/application/provider";
import * as process from "node:process";
import { container } from "tsyringe";
import { PrismaClientIssuer } from "../../../src/infrastructure/prisma/client";
import { CardanoShopifyAppClient } from "../../../src/infrastructure/libs/cardanoShopifyApp/api/client";
import logger from "../../../src/infrastructure/logging";
import { NftWalletType } from "@prisma/client";
import { SyncResult } from "./types";
import { syncNftsForWallet } from "./helpers/nftSyncer";
import { aggregateResults, printSummary } from "./helpers/outputGenerator";

async function main() {
  const issuer = container.resolve<PrismaClientIssuer>("PrismaClientIssuer");
  const cardanoShopifyAppClient = container.resolve(CardanoShopifyAppClient);

  logger.info("Starting Cardano NFT sync process...");
  logger.info("This script syncs NFTs from CardanoShopifyApp to nftInstances table.");

  const internalWallets = await issuer.internal(async (tx) => {
    return tx.nftWallet.findMany({
      where: { type: NftWalletType.INTERNAL },
      select: { id: true, walletAddress: true, userId: true },
    });
  });

  logger.info(`Found ${internalWallets.length} INTERNAL wallets to sync`);

  const syncResults: SyncResult[] = [];
  for (const wallet of internalWallets) {
    try {
      const result = await syncNftsForWallet(
        issuer,
        cardanoShopifyAppClient,
        wallet.id,
        wallet.walletAddress,
      );
      syncResults.push(result);
    } catch (err) {
      logger.error(`Unexpected error syncing wallet`, {
        walletAddress: wallet.walletAddress,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const processing = aggregateResults(syncResults);
  printSummary(processing, internalWallets.length);
}

main()
  .then(() => {
    logger.info("Sync script finished");
    process.exit(0);
  })
  .catch((err) => {
    logger.error("Sync script error", err);
    process.exit(1);
  });
