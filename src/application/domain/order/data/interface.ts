import { Prisma } from '@prisma/client';
import { IContext } from '@/types/server';
import { OrderWithItems } from '../type';

export interface IOrderRepository {
  create(
    ctx: IContext,
    data: Prisma.OrderCreateInput,
    tx?: Prisma.TransactionClient
  ): Promise<OrderWithItems>;

  createWithItems(
    ctx: IContext,
    orderData: Omit<Prisma.OrderCreateInput, 'items'>,
    items: Array<{
      productId: string;
      quantity: number;
      priceSnapshot: number;
    }>,
    tx?: Prisma.TransactionClient,
  ): Promise<OrderWithItems>;

  findById(
    ctx: IContext,
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<OrderWithItems | null>;

  update(
    ctx: IContext,
    id: string,
    data: Prisma.OrderUpdateInput,
    tx?: Prisma.TransactionClient
  ): Promise<OrderWithItems>;
}

export interface IOrderService {
  create(
    ctx: IContext,
    input: { 
      userId: string;
      items: Array<{ productId: string; quantity: number; priceSnapshot: number }>;
    },
    tx?: Prisma.TransactionClient
  ): Promise<OrderWithItems>;
  
  updateOrderWithExternalRef(
    ctx: IContext, 
    orderId: string, 
    externalRef: string,
    tx?: Prisma.TransactionClient
  ): Promise<OrderWithItems>;
}
