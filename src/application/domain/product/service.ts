import { injectable, inject } from 'tsyringe';
import { Prisma } from '@prisma/client';
import { IContext } from '@/types/server';
import { IProductService } from './data/interface';
import ProductRepository from './data/repository';
import { OrderItemReadService } from '@/application/domain/order/orderItem/service';
import { PrismaProductForValidation } from './data/type';
import { ProductNotFoundError, InsufficientInventoryError, OrderValidationError } from '@/application/domain/order/errors';
import logger from '@/infrastructure/logging';

export interface InventorySnapshot {
  productId: string;
  reserved: number;
  soldPendingMint: number; 
  minted: number;
  available: number;
  maxSupply: number | null;
}

export interface ProductSnapshot {
  id: string;
  price: number;
  maxSupply: number | null;
  nft: {
    policyId: string;
    externalRef: string;
  } | null;
}

@injectable()
export default class ProductService implements IProductService {
  constructor(
    @inject("ProductRepository") private readonly repository: ProductRepository,
    @inject("OrderItemReadService") private readonly orderItemReadService: OrderItemReadService,
  ) {}

  async findProductForValidation(
    ctx: IContext,
    productId: string,
    tx?: Prisma.TransactionClient
  ): Promise<PrismaProductForValidation | null> {
    return this.repository.findByIdForValidation(ctx, productId, tx);
  }

  async validateProductForOrder(
    ctx: IContext,
    productId: string,
    tx?: Prisma.TransactionClient
  ): Promise<PrismaProductForValidation> {
    const product = await this.findProductForValidation(ctx, productId, tx);
    
    if (!product) {
      throw new ProductNotFoundError(productId);
    }
    
    if (product.type !== 'NFT') {
      throw new OrderValidationError(`Product is not an NFT: ${productId}`);
    }
    
    if (!product.nftProduct) {
      throw new OrderValidationError(`NFT product not found for product: ${productId}`);
    }
    
    if (!product.nftProduct?.externalRef) {
      throw new OrderValidationError(`NFT product missing externalRef: ${productId}`);
    }
    
    return product;
  }

  async getForOrder(ctx: IContext, productIds: string[], tx?: Prisma.TransactionClient): Promise<ProductSnapshot[]> {
    const products = await Promise.all(
      productIds.map(id => this.findProductForValidation(ctx, id, tx))
    );
    
    return products.map(product => {
      if (!product) {
        throw new Error(`Product not found`);
      }
      
      return {
        id: product.id,
        price: product.price,
        maxSupply: product.maxSupply,
        nft: product.nftProduct ? {
          policyId: product.nftProduct.policyId!,
          externalRef: product.nftProduct.externalRef!,
        } : null,
      };
    });
  }

  async calculateInventory(ctx: IContext, productId: string, tx?: Prisma.TransactionClient): Promise<InventorySnapshot> {
    if (tx) {
      return this.calculateInventoryWithTx(ctx, tx, productId);
    }
    return ctx.issuer.public(ctx, (transaction) => {
      return this.calculateInventoryWithTx(ctx, transaction, productId);
    });
  }
  

  private async calculateInventoryWithTx(ctx: IContext, tx: Prisma.TransactionClient, productId: string): Promise<InventorySnapshot> {
    const [product, inventoryAggregates] = await Promise.all([
      tx.product.findUnique({ where: { id: productId }, select: { maxSupply: true } }),
      this.orderItemReadService.getInventoryCounts(ctx, productId, tx),
    ]);
    
    const maxSupply = product?.maxSupply || null;
    const { reserved, soldPendingMint, minted } = inventoryAggregates;
    const available = maxSupply == null ? Number.MAX_SAFE_INTEGER : Math.max(0, maxSupply - reserved - soldPendingMint - minted);
    
    return { productId, reserved, soldPendingMint, minted, available, maxSupply };
  }

  async reserveInventory(
    ctx: IContext,
    items: Array<{ productId: string; quantity: number }>,
    tx: Prisma.TransactionClient
  ): Promise<void> {
    for (const item of items) {
      const inventory = await this.calculateInventoryWithTx(ctx, tx, item.productId);
      
      if (inventory.maxSupply != null && inventory.available < item.quantity) {
        throw new InsufficientInventoryError(
          `Insufficient inventory for product ${item.productId}. Available: ${inventory.available}, Requested: ${item.quantity}`,
          item.productId,
          inventory.available,
          item.quantity
        );
      }
    }
  }

  async transferToSoldPending(
    ctx: IContext,
    orderItemIds: string[],
    tx: Prisma.TransactionClient
  ): Promise<void> {
    logger.info("Transferring inventory to sold pending", { orderItemIds });
    
    const orderItems = await tx.orderItem.findMany({
      where: { id: { in: orderItemIds } },
      include: { product: true, order: true }
    });
    
    for (const item of orderItems) {
      const inventoryBefore = await this.calculateInventoryWithTx(ctx, tx, item.productId);
      
      if (inventoryBefore.maxSupply != null && inventoryBefore.available < item.quantity) {
        logger.error("Insufficient inventory for transfer to sold pending", {
          orderItemId: item.id,
          productId: item.productId,
          available: inventoryBefore.available,
          requested: item.quantity,
          inventorySnapshot: inventoryBefore
        });
        throw new InsufficientInventoryError(
          `Insufficient inventory for product ${item.productId}. Available: ${inventoryBefore.available}, Requested: ${item.quantity}`,
          item.productId,
          inventoryBefore.available,
          item.quantity
        );
      }
      
      await tx.order.update({
        where: { id: item.order.id },
        data: { status: 'PAID' }
      });
      
      const inventoryAfter = await this.calculateInventoryWithTx(ctx, tx, item.productId);
      logger.info("Inventory transfer audit", {
        orderItemId: item.id,
        productId: item.productId,
        orderId: item.order.id,
        inventoryBefore,
        inventoryAfter,
        transition: "PENDING->PAID",
        transferredQuantity: item.quantity,
        inventoryDelta: {
          reserved: inventoryAfter.reserved - inventoryBefore.reserved,
          soldPendingMint: inventoryAfter.soldPendingMint - inventoryBefore.soldPendingMint,
          available: inventoryAfter.available - inventoryBefore.available
        }
      });
    }
  }

  async commitMinted(
    ctx: IContext,
    orderItemIds: string[],
    tx: Prisma.TransactionClient
  ): Promise<void> {
    logger.info("Committing minted inventory", { orderItemIds });
    
    const orderItems = await tx.orderItem.findMany({
      where: { id: { in: orderItemIds } },
      include: { product: true, nftMints: true }
    });
    
    for (const item of orderItems) {
      const inventoryBefore = await this.calculateInventoryWithTx(ctx, tx, item.productId);
      
      const successfulMints = item.nftMints.filter(mint => mint.status === 'MINTED');
      const failedMints = item.nftMints.filter(mint => mint.status === 'FAILED');
      
      if (successfulMints.length !== item.quantity) {
        logger.warn("Minting quantity mismatch", {
          orderItemId: item.id,
          expectedQuantity: item.quantity,
          actualMinted: successfulMints.length,
          failedMints: failedMints.length,
          nftMintStatuses: item.nftMints.map(m => ({ id: m.id, status: m.status }))
        });
      }
      
      await tx.nftMint.updateMany({
        where: { 
          id: { in: successfulMints.map(m => m.id) },
          status: 'SUBMITTED'
        },
        data: { status: 'MINTED' }
      });
      
      if (failedMints.length > 0) {
        await tx.nftMint.updateMany({
          where: { 
            id: { in: failedMints.map(m => m.id) },
            status: { in: ['SUBMITTED', 'QUEUED'] }
          },
          data: { status: 'FAILED' }
        });
        
        logger.warn("Failed mints detected - inventory returned to available pool", {
          orderItemId: item.id,
          productId: item.productId,
          failedMintIds: failedMints.map(m => m.id),
          returnedQuantity: failedMints.length
        });
      }
      
      const inventoryAfter = await this.calculateInventoryWithTx(ctx, tx, item.productId);
      logger.info("Minting completion audit", {
        orderItemId: item.id,
        productId: item.productId,
        nftMintIds: item.nftMints.map(m => m.id),
        inventoryBefore,
        inventoryAfter,
        transition: "SUBMITTED->MINTED",
        mintedQuantity: successfulMints.length,
        failedQuantity: failedMints.length,
        expectedQuantity: item.quantity,
        inventoryDelta: {
          soldPendingMint: inventoryAfter.soldPendingMint - inventoryBefore.soldPendingMint,
          minted: inventoryAfter.minted - inventoryBefore.minted,
          available: inventoryAfter.available - inventoryBefore.available
        }
      });
    }
  }

  async validateProductsForOrder(
    ctx: IContext,
    productIds: string[],
    tx?: Prisma.TransactionClient
  ): Promise<PrismaProductForValidation[]> {
    const products = await this.repository.findManyByIdsForValidation(ctx, productIds, tx);
    
    for (const productId of productIds) {
      const product = products.find(p => p.id === productId);
      if (!product) {
        throw new ProductNotFoundError(productId);
      }
      
      if (product.type !== 'NFT') {
        throw new OrderValidationError(`Product is not an NFT: ${productId}`);
      }
      
      if (!product.nftProduct?.externalRef) {
        throw new OrderValidationError(`NFT product missing externalRef: ${productId}`);
      }
    }
    
    return products;
  }
}
