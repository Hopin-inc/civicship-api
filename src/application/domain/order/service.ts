import { injectable, inject } from 'tsyringe';
import { IContext } from '@/types/server';
import { Prisma } from '@prisma/client';
import { getCurrentUserId } from '@/application/domain/utils';
import InventoryService from '@/application/domain/product/inventory/service';
import ProductService from '@/application/domain/product/service';
import OrderRepository from './data/repository';
import OrderConverter from './data/converter';
import { IOrderService } from './data/interface';
import { orderSelectWithItems, OrderWithItems } from './data/type';

@injectable()
export default class OrderService implements IOrderService {
  constructor(
    @inject("OrderRepository") private readonly repository: OrderRepository,
    @inject("OrderConverter") private readonly converter: OrderConverter,
    @inject("InventoryService") private readonly inventoryService: InventoryService,
    @inject("ProductService") private readonly productService: ProductService,
  ) {}

  async createWithReservation(
    ctx: IContext,
    input: { items: Array<{ productId: string; quantity: number }>; receiverAddress: string },
    tx?: Prisma.TransactionClient
  ): Promise<{ order: OrderWithItems; createdItems: OrderWithItems['items'] }> {
    const currentUserId = getCurrentUserId(ctx);
    
    const executeInTransaction = async (transaction: Prisma.TransactionClient) => {
      const item = input.items[0];
      const { productId, quantity } = item;

      const product = await this.validateProduct(ctx, transaction, productId);
      await this.reserveInventory(ctx, productId, quantity, transaction);
      
      const order = await this.createOrder(
        ctx,
        currentUserId,
        productId,
        quantity,
        product.price,
        transaction
      );

      return { order, createdItems: order.items };
    };

    if (tx) {
      return executeInTransaction(tx);
    } else {
      return ctx.issuer.onlyBelongingCommunity(ctx, executeInTransaction);
    }
  }

  private async validateProduct(ctx: IContext, tx: Prisma.TransactionClient, productId: string) {
    return this.productService.validateProductForOrder(ctx, productId, tx);
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


  private validateInventoryAvailable(available: number, requested: number): void {
    if (available < requested) {
      throw new Error(`Insufficient inventory. Available: ${available}, Requested: ${requested}`);
    }
  }

  async updateOrderWithExternalRef(
    ctx: IContext, 
    orderId: string, 
    externalRef: string,
    tx?: Prisma.TransactionClient
  ) {
    return this.repository.update(ctx, orderId, 
      this.converter.toPrismaUpdateInput(externalRef), tx
    );
  }
}
