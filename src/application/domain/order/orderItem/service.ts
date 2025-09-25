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

  async getInventoryCounts(ctx: IContext, productId: string, tx?: Prisma.TransactionClient) {
    const reservedWhere = this.converter.reservedByProduct(productId);
    const pendingMintWhere = this.converter.soldPendingMintByProduct(productId);

    const [reserved, soldPendingMint] = await Promise.all([
      this.repo.countByWhere(ctx, reservedWhere, tx),
      this.repo.countByWhere(ctx, pendingMintWhere, tx),
    ]);
    return { reserved, soldPendingMint };
  }
}
