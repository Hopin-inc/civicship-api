import { injectable } from 'tsyringe';
import { Prisma, OrderStatus, PaymentProvider } from '@prisma/client';

interface OrderCreateData {
  userId: string;
  totalAmount: number;
}

@injectable()
export default class OrderConverter {
  toPrismaCreateInput(data: OrderCreateData): Prisma.OrderCreateInput {
    return {
      status: OrderStatus.PENDING,
      paymentProvider: PaymentProvider.NMKR,
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
