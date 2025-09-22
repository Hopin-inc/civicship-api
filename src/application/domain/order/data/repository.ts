import { injectable } from 'tsyringe';
import { Prisma } from '@prisma/client';
import { IContext } from '@/types/server';
import { IOrderRepository } from './interface';
import { orderSelectWithItems, OrderWithItems } from '../type';

@injectable()
export default class OrderRepository implements IOrderRepository {
  async create(
    ctx: IContext,
    data: Prisma.OrderCreateInput
  ): Promise<OrderWithItems> {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.order.create({
        data,
        ...orderSelectWithItems,
      });
    });
  }

  async findById(
    ctx: IContext,
    id: string
  ): Promise<OrderWithItems | null> {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.order.findUnique({
        where: { id },
        ...orderSelectWithItems,
      });
    });
  }

  async update(
    ctx: IContext,
    id: string,
    data: Prisma.OrderUpdateInput
  ): Promise<OrderWithItems> {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.order.update({
        where: { id },
        data,
        ...orderSelectWithItems,
      });
    });
  }
}
