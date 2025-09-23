import { injectable } from 'tsyringe';
import { Prisma } from '@prisma/client';

interface OrderCreateData {
  userId: string;
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
      }
    };
  }

  toPrismaUpdateInput(externalRef: string): Prisma.OrderUpdateInput {
    return {
      externalRef,
    };
  }
}
