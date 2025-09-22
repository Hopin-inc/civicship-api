import { injectable } from 'tsyringe';
import { Prisma } from '@prisma/client';

interface OrderCreateData {
  userId: string;
  productId: string;
  quantity: number;
  priceSnapshot: number;
  totalAmount: number;
}

@injectable()
export default class OrderConverter {
  toPrismaCreateInput(data: OrderCreateData): Prisma.OrderCreateInput {
    return {
      status: 'PENDING',
      paymentProvider: 'NMKR',
      totalAmount: data.totalAmount,
      user: {
        connect: { id: data.userId }
      },
      items: {
        create: {
          quantity: data.quantity,
          priceSnapshot: data.priceSnapshot,
          product: {
            connect: { id: data.productId }
          }
        }
      }
    };
  }

  toPrismaUpdateInput(externalRef: string): Prisma.OrderUpdateInput {
    return {
      externalRef,
    };
  }
}
