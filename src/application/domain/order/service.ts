import { injectable, inject } from 'tsyringe';
import { IContext } from '@/types/server';
import { Prisma } from '@prisma/client';
import OrderRepository from './data/repository';
import OrderConverter from './data/converter';
import { OrderItemRepository } from './orderItem/data/repository';
import { IOrderService } from './data/interface';
import { orderSelectWithItems, OrderWithItems } from './data/type';

@injectable()
export default class OrderService implements IOrderService {
  constructor(
    @inject("OrderRepository") private readonly repository: OrderRepository,
    @inject("OrderConverter") private readonly converter: OrderConverter,
    @inject("OrderItemRepository") private readonly orderItemRepository: OrderItemRepository,
  ) {}

  async create(
    ctx: IContext,
    input: { 
      userId: string;
      items: Array<{ productId: string; quantity: number; priceSnapshot: number }>;
    },
    tx?: Prisma.TransactionClient
  ): Promise<OrderWithItems> {
    const executeInTransaction = async (transaction: Prisma.TransactionClient) => {
      const totalAmount = input.items.reduce((sum, item) => sum + (item.priceSnapshot * item.quantity), 0);
      
      const orderData = this.converter.toPrismaCreateInput({
        userId: input.userId,
        totalAmount,
      });

      const order = await transaction.order.create({
        data: orderData,
        ...orderSelectWithItems,
      });

      for (const item of input.items) {
        const orderItemData = {
          order: { connect: { id: order.id } },
          product: { connect: { id: item.productId } },
          quantity: item.quantity,
          priceSnapshot: item.priceSnapshot,
        };

        await this.orderItemRepository.create(ctx, orderItemData, transaction);
      }

      return transaction.order.findUnique({
        where: { id: order.id },
        ...orderSelectWithItems,
      }) as Promise<OrderWithItems>;
    };

    if (tx) {
      return executeInTransaction(tx);
    } else {
      return ctx.issuer.onlyBelongingCommunity(ctx, executeInTransaction);
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
