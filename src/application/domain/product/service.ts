import { injectable, inject } from "tsyringe";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { IProductService } from "./data/interface";
import ProductRepository from "./data/repository";
import { OrderItemReadService } from "@/application/domain/order/orderItem/service";
import { PrismaProduct } from "./data/type";
import ProductValidator from "@/application/domain/product/validator";

export interface InventorySnapshot {
  productId: string;
  reserved: number;
  soldPendingMint: number;
  minted: number;
  available: number;
  maxSupply: number | null;
}

@injectable()
export default class ProductService implements IProductService {
  constructor(
    @inject("ProductRepository") private readonly repository: ProductRepository,
    @inject("OrderItemReadService") private readonly orderItemReadService: OrderItemReadService,
  ) {}

  async validateProductForOrder(
    ctx: IContext,
    productId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaProduct> {
    const product = await this.repository.findProduct(ctx, productId, tx);
    ProductValidator.ensureIsValidForOrder(product, productId);

    return product;
  }

  async calculateInventory(
    ctx: IContext,
    productId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<InventorySnapshot> {
    if (tx) {
      return this.calculateInventoryWithTx(ctx, tx, productId);
    }
    return ctx.issuer.public(ctx, (transaction) => {
      return this.calculateInventoryWithTx(ctx, transaction, productId);
    });
  }

  private async calculateInventoryWithTx(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    productId: string,
  ): Promise<InventorySnapshot> {
    const [product, inventoryAggregates] = await Promise.all([
      tx.product.findUnique({ where: { id: productId }, select: { maxSupply: true } }),
      this.orderItemReadService.getInventoryCounts(ctx, productId, tx),
    ]);

    const maxSupply = product?.maxSupply || null;
    const { reserved, soldPendingMint, minted } = inventoryAggregates;
    const available =
      maxSupply == null
        ? Number.MAX_SAFE_INTEGER
        : Math.max(0, maxSupply - reserved - soldPendingMint - minted);

    return { productId, reserved, soldPendingMint, minted, available, maxSupply };
  }
}
