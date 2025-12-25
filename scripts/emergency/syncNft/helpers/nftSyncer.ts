import { PrismaClientIssuer } from "../../../../src/infrastructure/prisma/client";
import logger from "../../../../src/infrastructure/logging";
import { CardanoShopifyAppClient } from "../../../../src/infrastructure/libs/cardanoShopifyApp/api/client";
import { NftItemDto } from "../../../../src/infrastructure/libs/cardanoShopifyApp/type";
import { SyncResult } from "../types";

export async function syncNftsForWallet(
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
          where: { address: nft.policyId },
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
