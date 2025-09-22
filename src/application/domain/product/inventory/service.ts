import { injectable } from 'tsyringe';
import { IContext } from '@/types/server';
import { Prisma } from '@prisma/client';
import logger from '@/infrastructure/logging';

export interface InventorySnapshot {
  reserved: number;
  soldPendingMint: number; 
  minted: number;
  available: number;
}

@injectable()
export default class InventoryService {
  async calculateInventory(ctx: IContext, productId: string): Promise<InventorySnapshot> {
    return await ctx.issuer.internal(async (prisma) => {
      const [product, reserved, soldPendingMint, minted] = await Promise.all([
        prisma.product.findUnique({ where: { id: productId }, select: { maxSupply: true } }),
        this.getReservedCount(prisma, productId),
        this.getSoldPendingMintCount(prisma, productId), 
        this.getMintedCount(prisma, productId),
      ]);
      
      const maxSupply = product?.maxSupply || 0;
      const available = Math.max(0, maxSupply - reserved - soldPendingMint - minted);
      
      return { reserved, soldPendingMint, minted, available };
    });
  }
  
  private async getReservedCount(prisma: any, productId: string): Promise<number> {
    const result = await prisma.orderItem.aggregate({
      where: { productId, order: { status: 'PENDING' } },
      _sum: { quantity: true },
    });
    return result._sum.quantity || 0;
  }
  
  private async getSoldPendingMintCount(prisma: any, productId: string): Promise<number> {
    const result = await prisma.orderItem.aggregate({
      where: { 
        productId, 
        order: { status: 'PAID' },
        nftMints: { some: { status: 'SUBMITTED' } }
      },
      _sum: { quantity: true },
    });
    return result._sum.quantity || 0;
  }
  
  private async getMintedCount(prisma: any, productId: string): Promise<number> {
    const result = await prisma.orderItem.aggregate({
      where: { 
        productId,
        nftMints: { some: { status: 'MINTED' } }
      },
      _sum: { quantity: true },
    });
    return result._sum.quantity || 0;
  }

  async reserveInventory(tx: Prisma.TransactionClient, items: Array<{ productId: string; quantity: number }>): Promise<void> {
    for (const item of items) {
      const inventory = await this.calculateInventoryWithTx(tx, item.productId);
      
      if (inventory.available < item.quantity) {
        throw new Error(`Insufficient inventory for product ${item.productId}. Available: ${inventory.available}, Requested: ${item.quantity}`);
      }
    }
  }

  private async calculateInventoryWithTx(tx: Prisma.TransactionClient, productId: string): Promise<InventorySnapshot> {
    const [product, reserved, soldPendingMint, minted] = await Promise.all([
      tx.product.findUnique({ where: { id: productId }, select: { maxSupply: true } }),
      this.getReservedCountWithTx(tx, productId),
      this.getSoldPendingMintCountWithTx(tx, productId), 
      this.getMintedCountWithTx(tx, productId),
    ]);
    
    const maxSupply = product?.maxSupply || 0;
    const available = Math.max(0, maxSupply - reserved - soldPendingMint - minted);
    
    return { reserved, soldPendingMint, minted, available };
  }
  
  private async getReservedCountWithTx(tx: Prisma.TransactionClient, productId: string): Promise<number> {
    const result = await tx.orderItem.aggregate({
      where: { productId, order: { status: 'PENDING' } },
      _sum: { quantity: true },
    });
    return result._sum.quantity || 0;
  }
  
  private async getSoldPendingMintCountWithTx(tx: Prisma.TransactionClient, productId: string): Promise<number> {
    const result = await tx.orderItem.aggregate({
      where: { 
        productId, 
        order: { status: 'PAID' },
        nftMints: { some: { status: 'SUBMITTED' } }
      },
      _sum: { quantity: true },
    });
    return result._sum.quantity || 0;
  }
  
  private async getMintedCountWithTx(tx: Prisma.TransactionClient, productId: string): Promise<number> {
    const result = await tx.orderItem.aggregate({
      where: { 
        productId,
        nftMints: { some: { status: 'MINTED' } }
      },
      _sum: { quantity: true },
    });
    return result._sum.quantity || 0;
  }

  async transferToSoldPending(tx: Prisma.TransactionClient, orderItems: Array<{ productId: string; quantity: number }>): Promise<void> {
    logger.info("Transferring inventory to sold pending", { 
      orderItems: orderItems.map(item => ({ productId: item.productId, quantity: item.quantity }))
    });
  }
}
