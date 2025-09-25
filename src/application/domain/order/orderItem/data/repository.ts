import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { injectable } from "tsyringe";
import { IOrderItemRepository } from "@/application/domain/order/orderItem/data/interface";

@injectable()
export class OrderItemRepository implements IOrderItemRepository {
  async count(
    ctx: IContext,
    where: Prisma.OrderItemWhereInput,
    tx?: Prisma.TransactionClient,
  ): Promise<number> {
    const query: Prisma.OrderItemAggregateArgs = {
      where,
      _sum: { quantity: true },
    };

    if (tx) {
      const result = await tx.orderItem.aggregate(query);
      return result._sum?.quantity ?? 0;
    }

    return ctx.issuer.public(ctx, async (transaction) => {
      const result = await transaction.orderItem.aggregate(query);
      return result._sum?.quantity ?? 0;
    });
  }
}
