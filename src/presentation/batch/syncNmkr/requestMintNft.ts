import "reflect-metadata";
import "@/application/provider";
import logger from "@/infrastructure/logging";
import { container } from "tsyringe";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { NmkrClient } from "@/infrastructure/libs/nmkr/api/client";
import { NftMintStatus, NftInstanceStatus } from "@prisma/client";

function readNmkrProjectUid(json: unknown): string | undefined {
  if (typeof json !== "object" || json === null) return undefined;
  if ("nmkrProjectUid" in json && typeof json.nmkrProjectUid === "string") {
    return json.nmkrProjectUid;
  }
  if ("projectUid" in json && typeof json.projectUid === "string") {
    return json.projectUid;
  }
  return undefined;
}

export async function processQueuedMints() {
  logger.debug("🚀 Starting batch for QUEUED nftMints...");

  const issuer = container.resolve<PrismaClientIssuer>("PrismaClientIssuer");
  const nmkrClient = container.resolve(NmkrClient);

  try {
    const BATCH_SIZE = 20;
    let skip = 0;
    let hasMore = true;

    while (hasMore) {
      const mints = await issuer.internal((tx) =>
        tx.nftMint.findMany({
          where: { status: NftMintStatus.QUEUED },
          include: {
            nftInstance: {
              include: {
                nftToken: true,
                nftWallet: true,
              },
            },
          },
          take: BATCH_SIZE,
          skip,
        }),
      );

      if (mints.length === 0) {
        hasMore = false;
        break;
      }

      logger.debug(`📦 Processing ${mints.length} QUEUED mints`);

      for (const mint of mints) {
        try {
          const walletAddress = mint.nftInstance?.nftWallet?.walletAddress;
          const nftInstanceId = mint.nftInstance?.instanceId;

          if (!walletAddress || !nftInstanceId) {
            throw new Error(`Missing required data: walletAddress=${walletAddress}, nftInstanceId=${nftInstanceId}`);
          }

          const nmkrProjectUid = readNmkrProjectUid(mint.nftInstance?.nftToken?.json);
          if (!nmkrProjectUid) {
            throw new Error(`NMKR project UID not found in nftToken.json`);
          }

          await issuer.internal(async (tx) => {
            const res = await nmkrClient.mintAndSendSpecific(
              nmkrProjectUid,
              nftInstanceId,
              1,
              walletAddress,
            );

            await tx.nftMint.update({
              where: { id: mint.id },
              data: {
                status: NftMintStatus.SUBMITTED,
                externalRequestId: String(res.mintAndSendId),
                error: null,
              },
            });

            await tx.nftInstance.update({
              where: { id: mint.nftInstanceId },
              data: { status: NftInstanceStatus.MINTING },
            });
          });

          logger.debug(`✅ Submitted mint ${mint.id}`);
        } catch (err) {
          logger.error(`❌ Mint ${mint.id} submission failed: ${(err as Error).message}`);
          await issuer.internal((tx) =>
            tx.nftMint.update({
              where: { id: mint.id },
              data: {
                status: NftMintStatus.FAILED,
                retryCount: { increment: 1 },
                error: (err as Error).message,
              },
            }),
          );
        }
      }

      skip += BATCH_SIZE;
      if (mints.length < BATCH_SIZE) hasMore = false;
    }

    logger.debug("🎯 Batch completed");
  } catch (error) {
    logger.error("💥 Batch process error:", error);
    throw error;
  }
}

processQueuedMints();
