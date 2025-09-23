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
  validateAndReserveProduct(
    ctx: IContext,
    productId: string,
    quantity: number,
    tx: Prisma.TransactionClient
  ): Promise<any>;
  
  createOrderInTransaction(
    ctx: IContext,
    userId: string,
    productId: string,
    quantity: number,
    priceSnapshot: number,
    tx: Prisma.TransactionClient
  ): Promise<any>;
  
  requestNmkrPayment(
    externalRef: string,
    quantity: number,
    priceSnapshot: string,
    customProperty: string,
    receiverAddress: string
  ): Promise<any>;
  
  updateOrderWithExternalRef(ctx: IContext, orderId: string, externalRef: string): Promise<any>;
}
