import { injectable, inject } from "tsyringe";
import { IContext } from "@/types/server";
import { Prisma, OrderStatus, PaymentProvider } from "@prisma/client";
import OrderRepository from "@/application/domain/order/data/repository";
import { IOrderService } from "@/application/domain/order/data/interface";
import OrderConverter from "@/application/domain/order/data/converter";
import { OrderWithItems } from "@/application/domain/order/data/type";
import NftInstanceService from "@/application/domain/account/nft-instance/service";
import logger from "@/infrastructure/logging";

@injectable()
export default class OrderService implements IOrderService {
  constructor(
    @inject("OrderRepository") private readonly repository: OrderRepository,
    @inject("OrderConverter") private readonly converter: OrderConverter,
    @inject("NftInstanceService") private readonly nftInstanceService: NftInstanceService,
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

  async handlePaymentFailure(
    ctx: IContext,
    orderId: string,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    await this.processPaymentFailure(ctx, orderId, tx);
    
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (order?.items) {
      for (const item of order.items) {
        await this.releaseItemReservations(ctx, item, tx);
      }
    }
  }

  private async releaseItemReservations(
    ctx: IContext,
    item: { productId: string; quantity: number },
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const nftInstances = await this.nftInstanceService.findReservedInstancesForProduct(
      ctx,
      item.productId,
      item.quantity,
      tx,
    );

    const instanceIds = nftInstances.map(instance => instance.id);
    await this.nftInstanceService.releaseReservations(ctx, instanceIds, tx);
  }
}
