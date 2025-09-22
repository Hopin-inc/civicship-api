import { Prisma } from '@prisma/client';
import { IContext } from '@/types/server';
import { OrderWithItems } from '../type';

export interface IOrderRepository {
  create(
    ctx: IContext,
    data: Prisma.OrderCreateInput
  ): Promise<OrderWithItems>;

  findById(
    ctx: IContext,
    id: string
  ): Promise<OrderWithItems | null>;

  update(
    ctx: IContext,
    id: string,
    data: Prisma.OrderUpdateInput
  ): Promise<OrderWithItems>;
}
