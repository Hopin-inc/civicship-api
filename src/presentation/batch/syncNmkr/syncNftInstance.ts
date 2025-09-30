import "reflect-metadata";
import "@/application/provider";
import logger from "@/infrastructure/logging";
import { container } from "tsyringe";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { NmkrClient } from "@/infrastructure/libs/nmkr/api";
import { NftInstanceStatus, NftMintStatus } from "@prisma/client";

function isSuccessState(state: string): boolean {
  return ["minted", "sold"].includes(state.toLowerCase());
}

function isFailedState(state: string): boolean {
  return ["error", "failed"].includes(state.toLowerCase());
}

export async function syncMintingInstances() {
  logger.info("🚀 Starting sync for MINTING nftInstances...");

  const issuer = container.resolve<PrismaClientIssuer>("PrismaClientIssuer");
  const client = container.resolve(NmkrClient);

  try {
    const BATCH_SIZE = 50;
    let skip = 0;
    let totalProcessed = 0;
    let totalErrors = 0;
    let hasMore = true;

    while (hasMore) {
      const instances = await issuer.internal((tx) =>
        tx.nftInstance.findMany({
          where: { status: NftInstanceStatus.MINTING },
          include: {
            nftMint: true,
          },
          take: BATCH_SIZE,
          skip,
        }),
      );

      if (instances.length === 0) {
        hasMore = false;
        break;
      }

      logger.info(
        `📦 Processing batch ${Math.floor(skip / BATCH_SIZE) + 1}: ${instances.length} instances`,
      );

      for (const instance of instances) {
        try {
          const details = await client.getNftDetails(instance.instanceId);

          logger.debug("📊 NFT Details:", details);

          if (isSuccessState(details.state)) {
            await issuer.internal(async (tx) => {
              await tx.nftInstance.update({
                where: { id: instance.id },
                data: { status: NftInstanceStatus.OWNED },
              });

              if (instance.nftMint) {
                await tx.nftMint.update({
                  where: { id: instance.nftMint.id },
                  data: {
                    status: NftMintStatus.MINTED,
                    txHash: details.initialminttxhash ?? undefined,
                  },
                });
              }
            });
            totalProcessed++;
            logger.info(`✅ Updated instance ${instance.id} to OWNED`);
          } else if (isFailedState(details.state)) {
            await issuer.internal(async (tx) => {
              await tx.nftInstance.update({
                where: { id: instance.id },
                data: { status: NftInstanceStatus.MINTING },
              });

              if (instance.nftMint) {
                await tx.nftMint.update({
                  where: { id: instance.nftMint.id },
                  data: {
                    status: NftMintStatus.FAILED,
                    error: "NMKR reported error during minting",
                  },
                });
              }
            });
            totalErrors++;
            logger.warn(`⚠️ Error state for instance ${instance.id}, kept as MINTING`);
          } else {
            logger.info(`⏳ Still minting: ${instance.id} (state=${details.state})`);
          }
        } catch (err) {
          totalErrors++;
          logger.error(
            `❌ Failed to sync instance ${instance.id}: ${(err as Error).message ?? String(err)}`,
          );
        }
      }

      skip += BATCH_SIZE;
      if (instances.length < BATCH_SIZE) hasMore = false;
    }

    logger.info(`🎯 Sync completed: ${totalProcessed} updated, ${totalErrors} errors`);
  } catch (error) {
    logger.error("💥 Batch process error:", error);
    throw error;
  }
}

syncMintingInstances();
