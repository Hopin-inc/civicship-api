import 'reflect-metadata';
import { injectable, inject } from 'tsyringe';
import { IContext } from '@/types/server';
import { NftMintStatus, Prisma } from '@prisma/client';
import NftMintService from '../service';
import ProductService from '@/application/domain/product/service';
import logger from '@/infrastructure/logging';

@injectable()
export default class NftMintWebhookService {
  constructor(
    @inject("NftMintService") private readonly nftMintService: NftMintService,
    @inject("ProductService") private readonly productService: ProductService,
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

      if (!this.shouldUpdateMint(currentMint.status, newStatus, currentMint.txHash || undefined, txHash)) {
        logger.info("Skipping stale state transition", {
          nftMintId,
          currentStatus: currentMint.status,
          newStatus,
          reason: "stale_event"
        });
        return;
      }

      await this.nftMintService.processStateTransition(ctx, {
        nftMintId,
        newStatus,
        txHash,
        error: newStatus === 'FAILED' ? `Failed in state: ${nmkrState}` : undefined,
      }, tx);

      if (newStatus === 'SUBMITTED') {
        await this.onPaidTransition(ctx, currentMint, tx);
      } else if (newStatus === 'MINTED') {
        await this.onMintedTransition(ctx, currentMint, tx);
      }

      if (currentMint.orderItem?.product) {
        const inventory = await this.productService.calculateInventory(ctx, currentMint.orderItem.product.id);
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

  private shouldUpdateMint(currentStatus: NftMintStatus, newStatus: NftMintStatus, currentTxHash?: string, newTxHash?: string): boolean {
    const canTransition = this.canTransitionTo(currentStatus, newStatus);
    if (!canTransition) return false;
    
    if (currentTxHash && !newTxHash) return false;
    
    return true;
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
}
