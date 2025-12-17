import "reflect-metadata";
import "@/application/provider";
import logger from "@/infrastructure/logging";
import { container } from "tsyringe";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { NmkrClient } from "@/infrastructure/libs/nmkr/api";
import { NftInstance, NftInstanceStatus, NftMint, NftMintStatus } from "@prisma/client";

const MAX_RETRIES = 3;

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
            nftMints: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
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
        const latestMint = instance.nftMints[0];
        if (!latestMint) {
          logger.warn(`⚠️ No mint record found for instance ${instance.id}`);
          continue;
        }

        try {
          const details = await client.getNftDetails(instance.instanceId);
          const state = (details.state ?? "").toLowerCase();
          const minted = details.minted;

          logger.debug("📊 NFT Details:", { instanceId: instance.instanceId, state, details });

          const result = await handleInstanceState(
            issuer,
            instance,
            latestMint,
            state,
            minted,
            details.initialminttxhash,
          );

          if (result === "processed") totalProcessed++;
          if (result === "error") totalErrors++;
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

// -------------------- 状態ハンドラ --------------------

async function handleInstanceState(
  issuer: PrismaClientIssuer,
  instance: NftInstance & { nftMints: NftMint[] },
  latestMint: NftMint,
  state: string,
  minted: boolean,
  txHash?: string | null,
): Promise<"processed" | "error" | "skipped"> {
  if (minted) {
    await issuer.internal(async (tx) => {
      await tx.nftInstance.update({
        where: { id: instance.id },
        data: { status: NftInstanceStatus.OWNED },
      });

      await tx.nftMint.update({
        where: { id: latestMint.id },
        data: {
          status: NftMintStatus.MINTED,
          txHash: txHash ?? undefined,
          error: null,
        },
      });
    });
    logger.info(`✅ Updated instance ${instance.id} to OWNED`);
    return "processed";
  }

  switch (state) {
    case "sold":
      await issuer.internal(async (tx) => {
        await tx.nftMint.update({
          where: { id: latestMint.id },
          data: { status: NftMintStatus.SUBMITTED, error: null },
        });
      });
      logger.info(`⏳ Instance ${instance.id} is SOLD, still minting`);
      return "skipped";

    case "error":
    case "failed":
      if (latestMint.retryCount >= MAX_RETRIES) {
        await issuer.internal(async (tx) => {
          await tx.nftMint.update({
            where: { id: latestMint.id },
            data: {
              status: NftMintStatus.FAILED,
              error: "NMKR reported persistent error during minting",
            },
          });
        });
        logger.error(`❌ Instance ${instance.id} marked as FAILED after ${MAX_RETRIES} retries`);
      } else {
        logger.warn(
          `⚠️ Instance ${instance.id} still failing (retryCount=${latestMint.retryCount}), will retry later`,
        );
      }
      return "error";

    default:
      logger.info(`⏳ Still minting: ${instance.id} (state=${state})`);
      return "skipped";
  }
}

syncMintingInstances();
