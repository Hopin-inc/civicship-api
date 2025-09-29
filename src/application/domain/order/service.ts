import { injectable, inject } from "tsyringe";
import { IContext } from "@/types/server";
import { Prisma, OrderStatus, PaymentProvider } from "@prisma/client";
import OrderRepository from "@/application/domain/order/data/repository";
import { IOrderService } from "@/application/domain/order/data/interface";
import OrderConverter from "@/application/domain/order/data/converter";
import { OrderWithItems } from "@/application/domain/order/data/type";
import logger from "@/infrastructure/logging";

@injectable()
export default class OrderService implements IOrderService {
  constructor(
    @inject("OrderRepository") private readonly repository: OrderRepository,
    @inject("OrderConverter") private readonly converter: OrderConverter,
  ) {}

  async createOrder(
    ctx: IContext,
    input: {
      userId: string;
      items: Array<{ productId: string; quantity: number; priceSnapshot: number }>;
      paymentProvider?: PaymentProvider;
    },
    tx?: Prisma.TransactionClient,
  ): Promise<OrderWithItems> {
    const totalAmount = input.items.reduce(
      (sum, item) => sum + item.priceSnapshot * item.quantity,
      0,
    );

    const createInput = this.converter.create(input.userId, totalAmount, input.items, input.paymentProvider);
    return await this.repository.create(ctx, createInput, tx);
  }

  async updateOrderWithExternalRef(
    ctx: IContext,
    orderId: string,
    externalRef: string,
    tx?: Prisma.TransactionClient,
  ) {
    return this.repository.update(ctx, orderId, { externalRef }, tx);
  }

  async updateOrderStatus(
    ctx: IContext,
    orderId: string,
    status: OrderStatus,
    tx?: Prisma.TransactionClient,
  ): Promise<OrderWithItems> {
    return this.repository.update(ctx, orderId, { status }, tx);
  }

  async processPaymentCompletion(
    ctx: IContext,
    orderId: string,
    paymentTransactionUid: string,
    tx: Prisma.TransactionClient,
  ): Promise<OrderWithItems> {
    const order = await this.updateOrderStatus(ctx, orderId, OrderStatus.PAID, tx);
    logger.info("[OrderService] Order marked as PAID", { orderId, paymentTransactionUid });
    return order;
  }

  async processPaymentFailure(
    ctx: IContext,
    orderId: string,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    await this.updateOrderStatus(ctx, orderId, OrderStatus.FAILED, tx);
  }
}
