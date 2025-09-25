import { injectable } from 'tsyringe';
import { Prisma, OrderStatus } from '@prisma/client';
import { IContext } from '@/types/server';
import { IOrderRepository } from './interface';
import { orderSelectWithItems, OrderWithItems } from '../type';

@injectable()
export default class OrderRepository implements IOrderRepository {
  async create(
    ctx: IContext,
    data: Prisma.OrderCreateInput,
    tx?: Prisma.TransactionClient
  ): Promise<OrderWithItems> {
    if (tx) {
      return tx.order.create({
        data,
        ...orderSelectWithItems,
      });
    }
    return ctx.issuer.internal(async (transaction) => {
      return transaction.order.create({
        data,
        ...orderSelectWithItems,
      });
    });
  }

  async findById(
    ctx: IContext,
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<OrderWithItems | null> {
    if (tx) {
      return tx.order.findUnique({
        where: { id },
        ...orderSelectWithItems,
      });
    }
    return ctx.issuer.public(ctx, (transaction) => {
      return transaction.order.findUnique({
        where: { id },
        ...orderSelectWithItems,
      });
    });
  }

  async createWithItems(
    ctx: IContext,
    orderData: Omit<Prisma.OrderCreateInput, 'items'>,
    items: Array<{
      productId: string;
      quantity: number;
      priceSnapshot: number;
    }>,
    tx?: Prisma.TransactionClient,
  ): Promise<OrderWithItems> {
    const orderCreateData: Prisma.OrderCreateInput = {
      ...orderData,
      items: {
        create: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          priceSnapshot: item.priceSnapshot,
        })),
      },
    };

    if (tx) {
      return tx.order.create({
        data: orderCreateData,
        ...orderSelectWithItems,
      });
    }
    return ctx.issuer.internal(async (transaction) =>
      transaction.order.create({
        data: orderCreateData,
        ...orderSelectWithItems,
      }),
    );
  }

  async update(
    ctx: IContext,
    id: string,
    data: Prisma.OrderUpdateInput,
    tx?: Prisma.TransactionClient
  ): Promise<OrderWithItems> {
    if (tx) {
      return tx.order.update({
        where: { id },
        data,
        ...orderSelectWithItems,
      });
    }
    return ctx.issuer.internal(async (transaction) => {
      return transaction.order.update({
        where: { id },
        data,
        ...orderSelectWithItems,
      });
    });
  }

  async updateStatus(
    ctx: IContext,
    orderId: string,
    status: OrderStatus,
    tx?: Prisma.TransactionClient
  ): Promise<OrderWithItems> {
    if (tx) {
      return tx.order.update({
        where: { id: orderId },
        data: { status },
        ...orderSelectWithItems,
      });
    }
    return ctx.issuer.internal(async (transaction) => {
      return transaction.order.update({
        where: { id: orderId },
        data: { status },
        ...orderSelectWithItems,
      });
    });
  }
}
