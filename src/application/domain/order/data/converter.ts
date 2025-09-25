import { injectable } from "tsyringe";
import { Prisma, OrderStatus, PaymentProvider } from "@prisma/client";

@injectable()
export default class OrderConverter {
  create(
    userId: string,
    totalAmount: number,
    items: Array<{ productId: string; quantity: number; priceSnapshot: number }>,
  ): Prisma.OrderCreateInput {
    return {
      status: OrderStatus.PENDING,
      paymentProvider: PaymentProvider.NMKR,
      totalAmount,
      user: {
        connect: { id: userId },
      },
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          priceSnapshot: item.priceSnapshot,
        })),
      },
    };
  }

  updateExternalRef(externalRef: string): Prisma.OrderUpdateInput {
    return {
      externalRef,
    };
  }
}
