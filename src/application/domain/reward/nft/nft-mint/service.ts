import { inject, injectable } from "tsyringe";
import { Prisma, NftMintStatus } from "@prisma/client";
import { IContext } from "@/types/server";
import { INftMintRepository } from "./data/interface";
import NftMintConverter from "./data/converter";
import { PrismaNftMint } from "@/application/domain/reward/nft/nft-mint/data/type";
import ProductService from "@/application/domain/product/service";
import logger from "@/infrastructure/logging";

@injectable()
export default class NftMintService {
  constructor(
    @inject("NftMintRepository") private readonly repo: INftMintRepository,
    @inject("NftMintConverter") private readonly converter: NftMintConverter,
    @inject("ProductService") private readonly productService: ProductService,
  ) {}

  async createForOrderItem(
    ctx: IContext,
    orderItemId: string,
    nftWalletId: string,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaNftMint> {
    const createData = this.converter.buildMintCreate({
      orderItemId,
      nftWalletId,
      sequenceNum: 0,
      receiver: "system-wallet",
    });

    return this.repo.create(ctx, createData, tx);
  }

  async processStateTransition(
    ctx: IContext,
    transition: {
      nftMintId: string;
      newStatus: NftMintStatus;
      txHash?: string;
      error?: string;
    },
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaNftMint> {
    const { nftMintId, newStatus, txHash, error } = transition;

    const currentMint = await this.repo.find(ctx, nftMintId);
    if (!currentMint) {
      throw new Error(`NftMint not found: ${nftMintId}`);
    }

    if (!this.canTransitionTo(currentMint.status as NftMintStatus, newStatus)) {
      logger.warn("Invalid state transition attempted", {
        nftMintId,
        currentStatus: currentMint.status,
        newStatus,
      });
      return currentMint;
    }

    return this.repo.updateStatus(ctx, nftMintId, newStatus, txHash, error, tx);
  }

  private canTransitionTo(currentStatus: NftMintStatus, newStatus: NftMintStatus): boolean {
    const statusRank: Record<NftMintStatus, number> = {
      QUEUED: 0,
      SUBMITTED: 1,
      MINTED: 2,
      FAILED: 2,
    };

    return statusRank[newStatus] > statusRank[currentStatus];
  }

  async processWebhookStateTransition(
    ctx: IContext,
    nftMintId: string,
    nmkrState: string,
    txHash?: string,
    paymentTransactionUid?: string,
  ): Promise<void> {
    const newStatus = this.mapNmkrStateToStatus(nmkrState);
    if (!newStatus) {
      logger.warn("Unknown NMKR state", { nmkrState, nftMintId });
      return;
    }

    await ctx.issuer.internal(async (tx: Prisma.TransactionClient) => {
      const currentMint = await tx.nftMint.findUnique({
        where: { id: nftMintId },
        include: { orderItem: { include: { product: true } } },
      });

      if (!currentMint) {
        logger.error("NftMint not found", { nftMintId });
        return;
      }

      if (
        !this.shouldUpdateMint(
          currentMint.status,
          newStatus,
          currentMint.txHash || undefined,
          txHash,
        )
      ) {
        logger.info("Skipping stale state transition", {
          nftMintId,
          currentStatus: currentMint.status,
          newStatus,
          reason: "stale_event",
        });
        return;
      }

      await this.processStateTransition(
        ctx,
        {
          nftMintId,
          newStatus,
          txHash,
          error: newStatus === NftMintStatus.FAILED ? `Failed in state: ${nmkrState}` : undefined,
        },
        tx,
      );

      if (newStatus === NftMintStatus.SUBMITTED) {
        await this.onPaidTransition(ctx, currentMint, tx);
      } else if (newStatus === NftMintStatus.MINTED) {
        await this.onMintedTransition(ctx, currentMint, tx);
      }

      if (currentMint.orderItem?.product) {
        const inventory = await this.productService.calculateInventory(
          ctx,
          currentMint.orderItem.product.id,
          tx,
        );
        logger.info("Inventory snapshot", {
          nftMintId,
          productId: currentMint.orderItem.product.id,
          inventory,
        });
      }
    });
  }

  private async onPaidTransition(
    ctx: IContext,
    mint: any,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    logger.info("Processing PAID transition", {
      nftMintId: mint.id,
      orderItemId: mint.orderItem?.id,
    });
  }

  private async onMintedTransition(
    ctx: IContext,
    mint: any,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    logger.info("Processing MINTED transition", {
      nftMintId: mint.id,
      orderItemId: mint.orderItem?.id,
    });
  }

  private mapNmkrStateToStatus(nmkrState: string): NftMintStatus | null {
    switch (nmkrState) {
      case "confirmed":
        return NftMintStatus.SUBMITTED;
      case "finished":
        return NftMintStatus.MINTED;
      case "canceled":
      case "expired":
        return NftMintStatus.FAILED;
      default:
        return null;
    }
  }

  private shouldUpdateMint(
    currentStatus: NftMintStatus,
    newStatus: NftMintStatus,
    currentTxHash?: string,
    newTxHash?: string,
  ): boolean {
    const canTransition = this.canTransitionTo(currentStatus, newStatus);
    if (!canTransition) return false;

    if (currentTxHash && !newTxHash) return false;

    return true;
  }
}
