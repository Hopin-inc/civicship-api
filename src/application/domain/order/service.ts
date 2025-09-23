import { injectable, inject } from 'tsyringe';
import { IContext } from '@/types/server';
import { Prisma } from '@prisma/client';
import { getCurrentUserId } from '@/application/domain/utils';
import InventoryService from '@/application/domain/product/inventory/service';
import OrderRepository from './data/repository';
import OrderConverter from './data/converter';
import { IOrderService } from './data/interface';
import { productSelectForValidation, ProductForValidation, orderSelectWithItems, OrderWithItems } from './data/type';

@injectable()
export default class OrderService implements IOrderService {
  constructor(
    @inject("OrderRepository") private readonly repository: OrderRepository,
    @inject("OrderConverter") private readonly converter: OrderConverter,
    @inject("InventoryService") private readonly inventoryService: InventoryService,
  ) {}

  async createWithReservation(
    ctx: IContext,
    input: { items: Array<{ productId: string; quantity: number }>; receiverAddress: string },
    tx: Prisma.TransactionClient
  ): Promise<{ order: OrderWithItems; createdItems: OrderWithItems['items'] }> {
    const currentUserId = getCurrentUserId(ctx);
    const item = input.items[0];
    const { productId, quantity } = item;

    const product = await this.validateProduct(tx, productId);
    await this.reserveInventory(ctx, productId, quantity, tx);
    
    const order = await this.createOrder(
      ctx,
      currentUserId,
      productId,
      quantity,
      product.price,
      tx
    );

    return { order, createdItems: order.items };
  }

  private async validateProduct(tx: Prisma.TransactionClient, productId: string) {
    const product = await tx.product.findUnique({
      where: { id: productId },
      ...productSelectForValidation
    });

    this.validateProductExists(product, productId);
    this.validateProductIsNft(product!, productId);
    this.validateNftProductExists(product!, productId);
    this.validateExternalRefExists(product!, productId);

    return product!;
  }

  private async reserveInventory(
    ctx: IContext,
    productId: string,
    quantity: number,
    tx: Prisma.TransactionClient
  ) {
    const inventory = await this.inventoryService.calculateInventory(ctx, productId);
    this.validateInventoryAvailable(inventory.available, quantity);
    await this.inventoryService.reserveInventory(tx, [{ productId, quantity }]);
  }

  private async createOrder(
    ctx: IContext,
    userId: string,
    productId: string,
    quantity: number,
    priceSnapshot: number,
    tx: Prisma.TransactionClient
  ) {
    const totalAmount = priceSnapshot * quantity;
    const orderData = this.converter.toPrismaCreateInput({
      userId,
      productId,
      quantity,
      priceSnapshot,
      totalAmount,
    });

    return tx.order.create({
      data: orderData,
      ...orderSelectWithItems,
    });
  }

  private validateProductExists(product: ProductForValidation | null, productId: string): void {
    if (!product) {
      throw new Error(`Product not found: ${productId}`);
    }
  }

  private validateProductIsNft(product: ProductForValidation, productId: string): void {
    if (product.type !== 'NFT') {
      throw new Error(`Product is not an NFT: ${productId}`);
    }
  }

  private validateNftProductExists(product: ProductForValidation, productId: string): void {
    if (!product.nftProduct) {
      throw new Error(`NFT product not found for product: ${productId}`);
    }
  }

  private validateExternalRefExists(product: ProductForValidation, productId: string): void {
    if (!product.nftProduct?.externalRef) {
      throw new Error(`NFT product missing externalRef: ${productId}`);
    }
  }

  private validateInventoryAvailable(available: number, requested: number): void {
    if (available < requested) {
      throw new Error(`Insufficient inventory. Available: ${available}, Requested: ${requested}`);
    }
  }

  async updateOrderWithExternalRef(ctx: IContext, orderId: string, externalRef: string) {
    return this.repository.update(ctx, orderId, 
      this.converter.toPrismaUpdateInput(externalRef)
    );
  }
}
