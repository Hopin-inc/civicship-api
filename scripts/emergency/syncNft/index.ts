import "reflect-metadata";
import "@/application/provider";
import * as process from "node:process";
import { container } from "tsyringe";
import { PrismaClientIssuer } from "../../../src/infrastructure/prisma/client";
import { CardanoShopifyAppClient } from "../../../src/infrastructure/libs/cardanoShopifyApp/api/client";
import logger from "../../../src/infrastructure/logging";
import { NftWalletType } from "@prisma/client";
import { SyncResult, SyncProcessingResult } from "./types";
import { NftItemDto } from "../../../src/infrastructure/libs/cardanoShopifyApp/type";

async function syncNftsForWallet(
  issuer: PrismaClientIssuer,
  cardanoShopifyAppClient: CardanoShopifyAppClient,
  walletId: string,
  walletAddress: string,
): Promise<SyncResult> {
  logger.debug(`Syncing NFTs for wallet`, { walletAddress });

  let nfts: NftItemDto[];
  try {
    const response = await cardanoShopifyAppClient.getNftsByAddress(walletAddress);
    nfts = response.nfts;
    logger.debug(`Fetched ${nfts.length} NFTs from CardanoShopifyApp`, { walletAddress });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logger.error(`Failed to fetch NFTs from CardanoShopifyApp`, {
      walletAddress,
      error: errorMessage,
    });
    return {
      kind: "apiFailed",
      walletAddress,
      error: errorMessage,
    };
  }

  if (nfts.length === 0) {
    logger.info(`No NFTs found for wallet`, { walletAddress });
    return {
      kind: "success",
      walletAddress,
      nftCount: 0,
      syncedCount: 0,
    };
  }

  let syncedCount = 0;
  try {
    await issuer.internal(async (tx) => {
      for (const nft of nfts) {
        const instanceId = `${nft.policyId}-${nft.assetNameHex}`;

        const nftToken = await tx.nftToken.findFirst({
          where: { policyId: nft.policyId },
        });

        if (!nftToken) {
          logger.warn(`NftToken not found for policyId, skipping`, {
            policyId: nft.policyId,
            assetName: nft.assetName,
          });
          continue;
        }

        await tx.nftInstance.upsert({
          where: {
            nftTokenId_instanceId: {
              nftTokenId: nftToken.id,
              instanceId,
            },
          },
          update: {
            nftWalletId: walletId,
            name: nft.metadata?.name || null,
            description: nft.metadata?.description?.join("\n") || null,
            imageUrl: nft.metadata?.image?.join("") || null,
            json: nft.metadata as object,
          },
          create: {
            instanceId,
            nftTokenId: nftToken.id,
            nftWalletId: walletId,
            name: nft.metadata?.name || null,
            description: nft.metadata?.description?.join("\n") || null,
            imageUrl: nft.metadata?.image?.join("") || null,
            json: nft.metadata as object,
          },
        });

        syncedCount++;
        logger.debug(`Synced NFT instance`, {
          instanceId,
          assetName: nft.assetName,
        });
      }
    });

    logger.info(`Successfully synced NFTs for wallet`, {
      walletAddress,
      nftCount: nfts.length,
      syncedCount,
    });

    return {
      kind: "success",
      walletAddress,
      nftCount: nfts.length,
      syncedCount,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logger.error(`Failed to save NFT instances to database`, {
      walletAddress,
      error: errorMessage,
    });
    return {
      kind: "dbFailed",
      walletAddress,
      error: errorMessage,
    };
  }
}

function aggregateResults(results: SyncResult[]): SyncProcessingResult {
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

function printSummary(processing: SyncProcessingResult, totalWallets: number): void {
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
