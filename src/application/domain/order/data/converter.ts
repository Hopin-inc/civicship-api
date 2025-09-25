import { injectable } from "tsyringe";
import { Prisma, OrderStatus, PaymentProvider } from "@prisma/client";

@injectable()
export default class OrderConverter {
  create(userId: string, totalAmount: number): Prisma.OrderCreateInput {
    return {
      status: OrderStatus.PENDING,
      paymentProvider: PaymentProvider.NMKR,
      totalAmount,
      user: {
        connect: { id: userId },
      },
    };
  }

  updateExternalRef(externalRef: string): Prisma.OrderUpdateInput {
    return {
      externalRef,
    };
  }
}
