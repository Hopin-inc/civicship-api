import "reflect-metadata";
import "@/application/provider";
import logger from "@/infrastructure/logging";
import { container } from "tsyringe";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import NftMintService from "@/application/domain/reward/nft-mint/service";
import { NftMintStatus, Provider } from "@prisma/client";
import { IContext } from "@/types/server";

export async function processQueuedMints() {
  logger.info("🚀 Starting batch for QUEUED nftMints...");

  const issuer = container.resolve<PrismaClientIssuer>("PrismaClientIssuer");
  const mintService = container.resolve(NftMintService);
  const ctx = { issuer } as IContext;

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
                nftWallet: true,
                nftProduct: {
                  include: {
                    product: { include: { integrations: true } },
                  },
                },
              },
            },
            orderItem: true,
          },
          take: BATCH_SIZE,
          skip,
        }),
      );

      if (mints.length === 0) {
        hasMore = false;
        break;
      }

      logger.info(`📦 Processing ${mints.length} QUEUED mints`);

      for (const mint of mints) {
        try {
          const nmkrProjectUid =
            mint.nftInstance?.nftProduct?.product?.integrations.find(
              (i) => i.provider === Provider.NMKR,
            )?.externalRef ?? "";
          const walletAddress = mint.nftInstance?.nftWallet?.walletAddress ?? "";
          const nftUid = mint.nftInstance?.instanceId ?? "";
          const orderId = mint.orderItem?.orderId ?? "";

          // --- NMKR submission 実行 ---
          await issuer.internal(async (tx) => {
            const res = await mintService.mintViaNmkr(
              ctx,
              {
                mintId: mint.id,
                projectUid: nmkrProjectUid,
                nftUid,
                walletAddress,
                orderId,
                orderItemId: mint.orderItemId,
              },
              tx,
            );

            await tx.nftMint.update({
              where: { id: mint.id },
              data: {
                status: NftMintStatus.SUBMITTED,
                externalRequestId: String(res.mintAndSendId),
                error: null,
              },
            });
          });

          logger.info(`✅ Submitted mint ${mint.id}`);
        } catch (err) {
          // 失敗 → FAILED + retryCount++
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

    logger.info("🎯 Batch completed");
  } catch (error) {
    logger.error("💥 Batch process error:", error);
    throw error;
  }
}

processQueuedMints();
