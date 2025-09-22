import { injectable } from 'tsyringe';
import { Prisma } from '@prisma/client';
import { IOrderRepository } from './interface';
import { orderSelectWithItems } from '../type';

@injectable()
export default class OrderRepository implements IOrderRepository {
  async create(
    tx: Prisma.TransactionClient,
    data: Prisma.OrderCreateInput
  ) {
    return await tx.order.create({
      data,
      ...orderSelectWithItems,
    });
  }

  async findById(
    tx: Prisma.TransactionClient,
    id: string
  ) {
    return await tx.order.findUnique({
      where: { id },
      ...orderSelectWithItems,
    });
  }

  async update(
    tx: Prisma.TransactionClient,
    id: string,
    data: Prisma.OrderUpdateInput
  ) {
    return await tx.order.update({
      where: { id },
      data,
      ...orderSelectWithItems,
    });
  }
}
