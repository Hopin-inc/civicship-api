import { Prisma } from '@prisma/client';
import { OrderWithItems } from '../type';

export interface IOrderRepository {
  create(
    tx: Prisma.TransactionClient,
    data: Prisma.OrderCreateInput
  ): Promise<OrderWithItems>;

  findById(
    tx: Prisma.TransactionClient,
    id: string
  ): Promise<OrderWithItems | null>;

  update(
    tx: Prisma.TransactionClient,
    id: string,
    data: Prisma.OrderUpdateInput
  ): Promise<OrderWithItems>;
}
