import { injectable, inject } from 'tsyringe';
import { IContext } from '@/types/server';
import { NftMintStatus, Prisma } from '@prisma/client';
import { shouldUpdateMint } from './stateTransition';
import InventoryService from '@/application/domain/product/inventory/service';
import logger from '@/infrastructure/logging';

@injectable()
export default class NmkrWebhookService {
  constructor(
    @inject("InventoryService") private readonly inventoryService: InventoryService,
  ) {}

  async processStateTransition(
    ctx: IContext,
    nftMintId: string,
    nmkrState: string,
    txHash?: string,
    paymentTransactionUid?: string
  ): Promise<void> {
    const newStatus = this.mapNmkrStateToStatus(nmkrState);
    if (!newStatus) {
      logger.warn("Unknown NMKR state", { nmkrState, nftMintId });
      return;
    }

    await ctx.issuer.internal(async (tx: Prisma.TransactionClient) => {
      const currentMint = await tx.nftMint.findUnique({
        where: { id: nftMintId },
        include: { orderItem: { include: { product: true } } }
      });

      if (!currentMint) {
        logger.error("NftMint not found", { nftMintId });
        return;
      }

      if (!shouldUpdateMint(currentMint.status, newStatus, currentMint.txHash || undefined, txHash)) {
        logger.info("Skipping stale state transition", {
          nftMintId,
          currentStatus: currentMint.status,
          newStatus,
          reason: "stale_event"
        });
        return;
      }

      await tx.nftMint.update({
        where: { id: nftMintId },
        data: {
          status: newStatus,
          txHash: txHash || currentMint.txHash,
          error: newStatus === 'FAILED' ? `Failed in state: ${nmkrState}` : null,
        },
      });

      if (newStatus === 'SUBMITTED') {
        await this.onPaidTransition(ctx, currentMint, tx);
      } else if (newStatus === 'MINTED') {
        await this.onMintedTransition(ctx, currentMint, tx);
      }

      if (currentMint.orderItem?.product) {
        const inventory = await this.inventoryService.calculateInventory(ctx, currentMint.orderItem.product.id);
        logger.info("Inventory snapshot", {
          nftMintId,
          productId: currentMint.orderItem.product.id,
          inventory
        });
      }
    });
  }

  private async onPaidTransition(ctx: IContext, mint: any, tx: Prisma.TransactionClient): Promise<void> {
    logger.info("Processing PAID transition", { 
      nftMintId: mint.id,
      orderItemId: mint.orderItem?.id 
    });
  }

  private async onMintedTransition(ctx: IContext, mint: any, tx: Prisma.TransactionClient): Promise<void> {
    logger.info("Processing MINTED transition", { 
      nftMintId: mint.id,
      orderItemId: mint.orderItem?.id 
    });
  }

  private mapNmkrStateToStatus(nmkrState: string): NftMintStatus | null {
    switch (nmkrState) {
      case 'confirmed': return 'SUBMITTED';
      case 'finished': return 'MINTED';
      case 'canceled':
      case 'expired': return 'FAILED';
      default: return null;
    }
  }
}
