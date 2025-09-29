import { injectable, inject, container } from "tsyringe";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { IProductService } from "./data/interface";
import ProductRepository from "./data/repository";
import { PrismaProduct, InventorySnapshot } from "./data/type";
import { IOrderItemService } from "@/application/domain/order/orderItem/data/interface";
import NftMintService from "@/application/domain/reward/nft-mint/service";
import { OrderWithItems } from "@/application/domain/order/data/type";
import logger from "@/infrastructure/logging";

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

  async snapshotOrderInventory(
    ctx: IContext,
    order: OrderWithItems,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    for (const item of order.items) {
      const inventory = await this.calculateProductInventory(ctx, item.productId, tx);
      logger.debug("[ProductService] Inventory snapshot", {
        orderId: order.id,
        orderItemId: item.id,
        inventory,
      });
    }
  }

  private async calculateProductInventory(
    ctx: IContext,
    productId: string,
    tx: Prisma.TransactionClient,
  ): Promise<InventorySnapshot> {
    const product = await tx.product.findUnique({
      where: { id: productId },
      select: { maxSupply: true },
    });

    const orderItemService = container.resolve<IOrderItemService>("OrderItemService");
    const nftMintService = container.resolve<NftMintService>("NftMintService");

    const [reserved, soldPendingMint, minted] = await Promise.all([
      orderItemService.countReservedByProduct(ctx, productId, tx),
      orderItemService.countSoldPendingMintByProduct(ctx, productId, tx),
      nftMintService.countMintedByProduct(ctx, productId, tx),
    ]);

    const maxSupply = product?.maxSupply ?? null;
    const available = maxSupply == null 
      ? Number.MAX_SAFE_INTEGER 
      : Math.max(0, (maxSupply ?? 0) - reserved - soldPendingMint - minted);

    return { productId, reserved, soldPendingMint, minted, available, maxSupply };
  }
}
