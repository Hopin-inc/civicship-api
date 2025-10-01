import { injectable, inject } from "tsyringe";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { PrismaProduct } from "@/application/domain/product/data/type";
import { IProductService } from "@/application/domain/product/data/interface";
import ProductRepository from "@/application/domain/product/data/repository";

@injectable()
export default class ProductService implements IProductService {
  constructor(@inject("ProductRepository") private readonly repository: ProductRepository) {}

  async findOrThrowForOrder(
    ctx: IContext,
    productId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaProduct> {
    const product = await this.repository.find(ctx, productId, tx);
    this.ensureIsValidForOrder(product, productId);

    return product;
  }

  private ensureIsValidForOrder(
    product: PrismaProduct | null,
    productId: string,
  ): asserts product is PrismaProduct {
    if (!product) {
      throw new Error(productId);
    }
    if (product.type !== "NFT") {
      throw new Error(`Product is not an NFT: ${productId}`);
    }
    if (!product.nftProduct) {
      throw new Error(`NFT product not found for product: ${productId}`);
    }
    if (!product.nftProduct.stripeProductId) {
      throw new Error(`NFT product missing stripeProductId: ${productId}`);
    }

    if (!product.nftProduct.nmkrProjectId) {
      throw new Error(`NFT product missing nmkrProjectId: ${productId}`);
    }
  }

  // async snapshotOrderInventory(
  //   ctx: IContext,
  //   order: OrderWithItems,
  //   tx: Prisma.TransactionClient,
  // ): Promise<InventorySnapshot[]> {
  //   const snapshots: InventorySnapshot[] = [];
  //
  //   for (const item of order.items) {
  //     try {
  //       const inventory = await this.calculateProductInventory(ctx, item.productId, tx);
  //
  //       if (inventory.available !== null && inventory.available < item.quantity) {
  //         throw new InsufficientInventoryError(
  //           item.productId,
  //           item.quantity,
  //           inventory.available
  //         );
  //       }
  //
  //       snapshots.push(inventory);
  //
  //       logger.debug("[ProductService] Inventory snapshot", {
  //         orderId: order.id,
  //         orderItemId: item.id,
  //         inventory,
  //       });
  //
  //     } catch (error) {
  //       logger.error("[ProductService] Inventory snapshot failed", {
  //         orderId: order.id,
  //         orderItemId: item.id,
  //         productId: item.productId,
  //         error: error instanceof Error ? error.message : String(error),
  //       });
  //
  //       if (error instanceof ProductNotFoundError ||
  //           error instanceof InsufficientInventoryError ||
  //           error instanceof OversellDetectedError) {
  //         throw error;
  //       }
  //
  //       throw new InventoryCalculationError(item.productId, error);
  //     }
  //   }
  //
  //   return snapshots;
  // }

  // private async calculateProductInventory(
  //   ctx: IContext,
  //   productId: string,
  //   tx: Prisma.TransactionClient,
  // ): Promise<InventorySnapshot> {
  //   try {
  //     const result = await this.calculateProductInventoryAtomic(ctx, productId, tx);
  //
  //     logger.debug("[ProductService] Inventory calculated", {
  //       productId,
  //       snapshot: result,
  //     });
  //
  //     return result;
  //   } catch (error) {
  //     logger.error("[ProductService] Inventory calculation failed", {
  //       productId,
  //       error: error instanceof Error ? error.message : String(error),
  //     });
  //
  //     if (error instanceof ProductNotFoundError) {
  //       throw error;
  //     }
  //
  //     throw new InventoryCalculationError(productId, error);
  //   }
  // }

  // private async calculateProductInventoryAtomic(
  //   ctx: IContext,
  //   productId: string,
  //   tx: Prisma.TransactionClient,
  // ): Promise<InventorySnapshot> {
  //   const result = await this.repository.calculateInventoryAtomic(ctx, productId, tx);
  //
  //   if (!result) {
  //     throw new ProductNotFoundError(productId);
  //   }
  //
  //   const { maxSupply, reserved, soldPendingMint, minted } = result;
  //
  //   const rawAvailable = maxSupply === null
  //     ? null
  //     : maxSupply - reserved - soldPendingMint - minted;
  //
  //   if (rawAvailable !== null && rawAvailable < 0) {
  //     const oversellAmount = Math.abs(rawAvailable);
  //
  //     logger.error("[ProductService] Oversell detected", {
  //       productId,
  //       maxSupply,
  //       reserved,
  //       soldPendingMint,
  //       minted,
  //       oversellAmount,
  //     });
  //
  //     throw new OversellDetectedError(productId, oversellAmount, {
  //       productId,
  //       reserved,
  //       soldPendingMint,
  //       minted,
  //       available: rawAvailable,
  //       maxSupply,
  //       calculatedAt: new Date(),
  //     });
  //   }
  //
  //   const available = maxSupply === null
  //     ? null
  //     : Math.max(0, rawAvailable!);
  //
  //   return {
  //     productId,
  //     reserved,
  //     soldPendingMint,
  //     minted,
  //     available,
  //     maxSupply,
  //     calculatedAt: new Date(),
  //   };
  // }
}
