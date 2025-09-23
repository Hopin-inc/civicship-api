import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { IOrderItemRepository } from "./interface";
import { orderItemInclude } from "./type";
import {
  whereReservedByProduct,
  whereSoldPendingMintByProduct,
  whereMintedByProduct,
} from "./converter";
import { injectable } from "tsyringe";

@injectable()
export class OrderItemRepository implements IOrderItemRepository {
  async findById(ctx: IContext, id: string, tx?: Prisma.TransactionClient) {
    if (tx) {
      return tx.orderItem.findUnique({ where: { id }, include: orderItemInclude });
    }
    return ctx.issuer.public(ctx, (t) =>
      t.orderItem.findUnique({ where: { id }, include: orderItemInclude }),
    );
  }

  async create(ctx: IContext, data: Prisma.OrderItemCreateInput, tx?: Prisma.TransactionClient) {
    if (tx) {
      return tx.orderItem.create({ data, include: orderItemInclude });
    }
    return ctx.issuer.public(ctx, (t) =>
      t.orderItem.create({ data, include: orderItemInclude }),
    );
  }

  async countReservedForProduct(ctx: IContext, productId: string, tx?: Prisma.TransactionClient) {
    const where = whereReservedByProduct(productId);
    if (tx) return tx.orderItem.count({ where });
    return ctx.issuer.public(ctx, (t) => t.orderItem.count({ where }));
  }

  async countSoldPendingMintForProduct(ctx: IContext, productId: string, tx?: Prisma.TransactionClient) {
    const where = whereSoldPendingMintByProduct(productId);
    if (tx) return tx.orderItem.count({ where });
    return ctx.issuer.public(ctx, (t) => t.orderItem.count({ where }));
  }

  async countMintedForProduct(ctx: IContext, productId: string, tx?: Prisma.TransactionClient) {
    const where = whereMintedByProduct(productId);
    if (tx) return tx.orderItem.count({ where });
    return ctx.issuer.public(ctx, (t) => t.orderItem.count({ where }));
  }
}
