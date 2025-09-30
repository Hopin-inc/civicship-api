import "reflect-metadata";
import "@/application/provider";
import logger from "@/infrastructure/logging";
import { container } from "tsyringe";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import NftMintService from "@/application/domain/reward/nft-mint/service";
import { NftInstanceStatus, NftMintStatus, Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { NmkrClient } from "@/infrastructure/libs/nmkr/api";

type MintWithRelations = Prisma.NftMintGetPayload<{
  include: {
    nftInstance: {
      include: {
        nftWallet: true;
        product: { include: { nftProduct: true } };
      };
    };
    orderItem: true;
  };
}>;

type InstanceNonNull = NonNullable<MintWithRelations["nftInstance"]>;

// -------------------- メイン処理 --------------------

export async function processQueuedMints() {
  logger.info("🚀 Starting batch for QUEUED nftMints...");

  const issuer = container.resolve<PrismaClientIssuer>("PrismaClientIssuer");
  const nmkrClient = container.resolve<NmkrClient>("NmkrClient");
  const mintService = container.resolve(NftMintService);
  const ctx = { issuer } as IContext;

  try {
    const BATCH_SIZE = 20;
    let skip = 0;
    let hasMore = true;

    while (hasMore) {
      const mints = await issuer.internal((tx) =>
        tx.nftMint.findMany({
          where: { status: { in: [NftMintStatus.QUEUED, NftMintStatus.FAILED] } },
          include: {
            nftInstance: {
              include: {
                nftWallet: true,
                product: { include: { nftProduct: true } },
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
        assertMintRequirements(mint);
        const instance = mint.nftInstance as InstanceNonNull;

        try {
          // --- 通常の NMKR mint 実行 ---
          await issuer.internal(async (tx) => {
            await mintService.mintViaNmkr(
              ctx,
              {
                mintId: mint.id,
                projectUid: instance.product!.nftProduct!.nmkrProjectId,
                nftUid: instance.instanceId,
                walletAddress: instance.nftWallet!.walletAddress,
                orderId: mint.orderItem?.orderId ?? "",
                orderItemId: mint.orderItemId,
              },
              tx,
            );
          });

          logger.info(`✅ Submitted mint ${mint.id} (instance=${instance.id})`);
        } catch (err) {
          // --- エラー時の fallback ---
          logger.warn(`⚠️ Mint ${mint.id} failed at first attempt, rechecking state...`);

          try {
            const details = await nmkrClient.getNftDetails(instance.instanceId);
            const state = (details.state ?? "").toLowerCase();

            await issuer.internal(async (tx) => {
              switch (state) {
                case "reserved":
                  await handleReserved(tx, mint, instance);
                  break;

                case "sold":
                  await handleSold(tx, mint, instance, details.receiveraddress);
                  break;

                case "minted":
                  await handleMinted(
                    tx,
                    mint,
                    instance,
                    details.receiveraddress,
                    details.initialminttxhash,
                  );
                  break;

                default:
                  throw new Error(`Unexpected NMKR state "${state}" for mint ${mint.id}`);
              }
            });
          } catch (checkErr) {
            // --- 再チェック失敗 or 不明な state ---
            logger.error(`❌ State recheck failed for ${mint.id}: ${String(checkErr)}`);
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
            logger.error(`❌ Mint ${mint.id} marked as FAILED: ${(err as Error).message}`);
          }
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

// -------------------- ハンドラ関数 --------------------

async function handleReserved(
  tx: Prisma.TransactionClient,
  mint: MintWithRelations,
  instance: InstanceNonNull,
) {
  await tx.nftMint.update({
    where: { id: mint.id },
    data: { status: NftMintStatus.SUBMITTED, error: null },
  });
  await tx.nftInstance.update({
    where: { id: instance.id },
    data: { status: NftInstanceStatus.MINTING },
  });
  logger.info(`⏳ Mint ${mint.id} reserved, still in progress`);
}

async function handleSold(
  tx: Prisma.TransactionClient,
  mint: MintWithRelations,
  instance: InstanceNonNull,
  receiverAddress?: string | null,
) {
  if (!receiverAddress) {
    throw new Error(`DatabaseIntegrityError: receiver address missing for mint ${mint.id}`);
  }

  const wallet = await tx.nftWallet.findUnique({
    where: { walletAddress: receiverAddress },
  });
  if (!wallet) {
    throw new Error(
      `DatabaseIntegrityError: receiver wallet ${receiverAddress} not found for mint ${mint.id}`,
    );
  }

  await tx.nftMint.update({
    where: { id: mint.id },
    data: {
      status: NftMintStatus.SUBMITTED,
      nftWalletId: wallet.id,
      error: null,
    },
  });
  await tx.nftInstance.update({
    where: { id: instance.id },
    data: {
      status: NftInstanceStatus.MINTING,
      nftWalletId: wallet.id,
    },
  });
  logger.info(`⏳ Mint ${mint.id} sold, awaiting chain mint`);
}

async function handleMinted(
  tx: Prisma.TransactionClient,
  mint: MintWithRelations,
  instance: InstanceNonNull,
  receiverAddress?: string | null,
  txHash?: string | null,
) {
  if (!receiverAddress) {
    throw new Error(`DatabaseIntegrityError: receiver address missing for minted NFT ${mint.id}`);
  }

  const wallet = await tx.nftWallet.findUnique({
    where: { walletAddress: receiverAddress },
  });
  if (!wallet) {
    throw new Error(
      `DatabaseIntegrityError: receiver wallet ${receiverAddress} not found for minted NFT ${mint.id}`,
    );
  }

  await tx.nftMint.update({
    where: { id: mint.id },
    data: {
      status: NftMintStatus.MINTED,
      txHash: txHash ?? undefined,
      nftWalletId: wallet.id,
      error: null,
    },
  });
  await tx.nftInstance.update({
    where: { id: instance.id },
    data: {
      status: NftInstanceStatus.OWNED,
      nftWalletId: wallet.id,
    },
  });
  logger.info(`✅ Mint ${mint.id} fully minted on-chain`);
}

// -------------------- バリデーション --------------------

function assertMintRequirements(mint: MintWithRelations): asserts mint is MintWithRelations & {
  nftInstance: {
    id: string;
    instanceId: string;
    nftWallet: { id: string; walletAddress: string };
    product: { nftProduct: { id: string; nmkrProjectId: string } };
  };
} {
  if (!mint.nftInstance) throw new Error(`nftInstance missing for mint ${mint.id}`);
  if (!mint.nftInstance.nftWallet)
    throw new Error(`nftWallet missing for instance ${mint.nftInstance.id}`);
  if (!mint.nftInstance.product)
    throw new Error(`product missing for instance ${mint.nftInstance.id}`);
  if (!mint.nftInstance.product.nftProduct)
    throw new Error(`nftProduct missing for instance ${mint.nftInstance.id}`);
}

processQueuedMints();
