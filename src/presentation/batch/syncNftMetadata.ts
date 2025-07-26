import "reflect-metadata";
import "@/application/provider";
import logger from "@/infrastructure/logging";
import { container } from "tsyringe";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { fetchData } from "@/utils/fetch";

interface BaseSepoliaNftItem {
  id: string;
  metadata: {
    name?: string;
    description?: string;
    image?: string;
  };
  token: {
    address: string;
    name?: string;
    symbol?: string;
    type: string;
  };
}

interface BaseSepoliaNftResponse {
  items: BaseSepoliaNftItem[];
  next_page_params: any;
}

export async function processNftWalletMetadata(
  wallet: { id: string; walletAddress: string },
  issuer: PrismaClientIssuer
): Promise<{ success: boolean; itemsProcessed: number; error?: string }> {
  try {
    logger.info(`🔄 Processing wallet: ${wallet.walletAddress}`);

    const apiUrl = `https://base-sepolia.blockscout.com/api/v2/addresses/${wallet.walletAddress}/nft`;
    const response = await fetchData<BaseSepoliaNftResponse>(apiUrl);

    if (!response.items || response.items.length === 0) {
      logger.info(`📭 No NFTs found for wallet: ${wallet.walletAddress}`);
      return { success: true, itemsProcessed: 0 };
    }

    await issuer.internal(async (tx) => {
      for (const item of response.items) {
        const nftToken = await tx.nftToken.upsert({
          where: { address: item.token.address },
          update: {
            name: item.token.name,
            symbol: item.token.symbol,
            type: item.token.type,
          },
          create: {
            address: item.token.address,
            name: item.token.name,
            symbol: item.token.symbol,
            type: item.token.type,
          },
        });

        await tx.nftInstance.upsert({
          where: {
            nftWalletId_instanceId: {
              nftWalletId: wallet.id,
              instanceId: item.id,
            },
          },
          update: {
            name: item.metadata.name,
            description: item.metadata.description,
            imageUrl: item.metadata.image,
            json: item,
            nftTokenId: nftToken.id,
          },
          create: {
            instanceId: item.id,
            name: item.metadata.name,
            description: item.metadata.description,
            imageUrl: item.metadata.image,
            json: item,
            nftWalletId: wallet.id,
            nftTokenId: nftToken.id,
          },
        });
      }
    });

    logger.info(`✅ Processed ${response.items.length} NFTs for wallet: ${wallet.walletAddress}`);
    return { success: true, itemsProcessed: response.items.length };
  } catch (error) {
    logger.error(`❌ Error processing wallet ${wallet.walletAddress}:`, error);
    return { success: false, itemsProcessed: 0, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function syncNftMetadata() {
  logger.info("🚀 Starting NFT metadata synchronization batch");

  const issuer = container.resolve<PrismaClientIssuer>("PrismaClientIssuer");

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
      const result = await processNftWalletMetadata(wallet, issuer);
      if (result.success) {
        totalProcessed++;
      } else {
        totalErrors++;
      }
    }

    logger.info(`🎯 NFT metadata sync completed: ${totalProcessed} wallets processed, ${totalErrors} errors`);
  } catch (error) {
    logger.error("💥 Batch process error:", error);
  }
}
