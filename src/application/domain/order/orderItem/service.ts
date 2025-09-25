import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { injectable, inject } from "tsyringe";
import { OrderItemRepository } from "./data/repository";
import { IOrderItemService } from "@/application/domain/order/orderItem/data/interface";
import OrderItemConverter from "@/application/domain/order/orderItem/data/converter";

@injectable()
export class OrderItemService implements IOrderItemService {
  constructor(
    @inject("OrderItemRepository") private readonly repo: OrderItemRepository,
    @inject("OrderItemConverter") private readonly converter: OrderItemConverter,
  ) {}

  async countReservedByProduct(ctx: IContext, productId: string, tx?: Prisma.TransactionClient) {
    const where = this.converter.reservedByProduct(productId);
    return this.repo.sumQuantityByWhere(ctx, where, tx);
  }

  async countSoldPendingMintByProduct(
    ctx: IContext,
    productId: string,
    tx?: Prisma.TransactionClient,
  ) {
    const where = this.converter.soldPendingMintByProduct(productId);
    return this.repo.sumQuantityByWhere(ctx, where, tx);
  }
}
