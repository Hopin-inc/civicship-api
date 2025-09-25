import { injectable, inject } from "tsyringe";
import { IContext } from "@/types/server";
import { Prisma, OrderStatus } from "@prisma/client";
import OrderRepository from "./data/repository";
import OrderConverter from "./data/converter";
import { IOrderService } from "./data/interface";
import { OrderWithItems } from "./data/type";

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
    },
    tx?: Prisma.TransactionClient,
  ): Promise<OrderWithItems> {
    const totalAmount = input.items.reduce(
      (sum, item) => sum + item.priceSnapshot * item.quantity,
      0,
    );

    const createInput = this.converter.create(input.userId, totalAmount);
    return await this.repository.createWithItems(ctx, createInput, input.items, tx);
  }

  async updateOrderWithExternalRef(
    ctx: IContext,
    orderId: string,
    externalRef: string,
    tx?: Prisma.TransactionClient,
  ) {
    const updateInput = this.converter.updateExternalRef(externalRef);
    return this.repository.update(ctx, orderId, updateInput, tx);
  }

  async updateOrderStatus(
    ctx: IContext,
    orderId: string,
    status: OrderStatus,
    tx?: Prisma.TransactionClient,
  ): Promise<OrderWithItems> {
    return this.repository.updateStatus(ctx, orderId, status, tx);
  }
}
