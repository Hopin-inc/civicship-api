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

export interface IOrderService {
  createWithReservation(
    ctx: IContext,
    input: { items: Array<{ productId: string; quantity: number }>; receiverAddress: string },
    tx: Prisma.TransactionClient
  ): Promise<{ order: OrderWithItems; createdItems: OrderWithItems['items'] }>;
  
  updateOrderWithExternalRef(ctx: IContext, orderId: string, externalRef: string): Promise<OrderWithItems>;
}
