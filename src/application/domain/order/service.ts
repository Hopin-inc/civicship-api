import { injectable, inject } from 'tsyringe';
import { IContext } from '@/types/server';
import { Prisma, OrderStatus } from '@prisma/client';
import OrderRepository from './data/repository';
import OrderConverter from './data/converter';
import { IOrderService } from './data/interface';
import { OrderWithItems } from './data/type';
import logger from '@/infrastructure/logging';

@injectable()
export default class OrderService implements IOrderService {
  constructor(
    @inject("OrderRepository") private readonly repository: OrderRepository,
    @inject("OrderConverter") private readonly converter: OrderConverter,
  ) {}

  async create(
    ctx: IContext,
    input: { 
      userId: string;
      items: Array<{ productId: string; quantity: number; priceSnapshot: number }>;
    },
    tx?: Prisma.TransactionClient
  ): Promise<OrderWithItems> {
    const totalAmount = input.items.reduce((sum, item) => sum + (item.priceSnapshot * item.quantity), 0);
    
    const orderData = this.converter.toPrismaCreateInput({
      userId: input.userId,
      totalAmount,
    });

    const order = await this.repository.createWithItems(ctx, orderData, input.items, tx);

    logger.info("Order created with items", {
      orderId: order.id,
      userId: input.userId,
      itemCount: input.items.length,
      totalAmount: order.totalAmount
    });

    return order;
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

  async updateOrderStatus(
    ctx: IContext, 
    orderId: string, 
    status: OrderStatus,
    tx?: Prisma.TransactionClient
  ): Promise<OrderWithItems> {
    return this.repository.updateStatus(ctx, orderId, status, tx);
  }
}
