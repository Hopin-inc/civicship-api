import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { IOrderItemRepository } from "./interface";
import { orderItemInclude } from "./type";
import {
  whereReservedByProduct,
  whereSoldPendingMintByProduct,
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
    return ctx.issuer.internal(async (t) =>
      t.orderItem.create({ data, include: orderItemInclude }),
    );
  }

  async createMany(
    ctx: IContext,
    items: Array<{
      orderId: string;
      productId: string;
      quantity: number;
      priceSnapshot: number;
    }>,
    tx: Prisma.TransactionClient
  ): Promise<void> {
    const data = items.map(item => ({
      orderId: item.orderId,
      productId: item.productId,
      quantity: item.quantity,
      priceSnapshot: item.priceSnapshot,
    }));
    
    await tx.orderItem.createMany({ data });
  }

  async countReservedForProduct(ctx: IContext, productId: string, tx?: Prisma.TransactionClient): Promise<number> {
    const where = whereReservedByProduct(productId);
    
    if (tx) {
      const result = await tx.orderItem.aggregate({ where, _sum: { quantity: true } });
      return result._sum.quantity ?? 0;
    }
    
    return ctx.issuer.public(ctx, async (transaction) => {
      const result = await transaction.orderItem.aggregate({ where, _sum: { quantity: true } });
      return result._sum.quantity ?? 0;
    });
  }

  async countSoldPendingMintForProduct(ctx: IContext, productId: string, tx?: Prisma.TransactionClient): Promise<number> {
    const where = whereSoldPendingMintByProduct(productId);
    
    if (tx) {
      const result = await tx.orderItem.aggregate({ where, _sum: { quantity: true } });
      return result._sum.quantity ?? 0;
    }
    
    return ctx.issuer.public(ctx, async (transaction) => {
      const result = await transaction.orderItem.aggregate({ where, _sum: { quantity: true } });
      return result._sum.quantity ?? 0;
    });
  }

  async countMintedForProduct(ctx: IContext, productId: string, tx?: Prisma.TransactionClient): Promise<number> {
    const query = { 
      where: { 
        status: 'MINTED' as const, 
        orderItem: { productId } 
      } 
    };
    
    if (tx) {
      return tx.nftMint.count(query);
    }
    
    return ctx.issuer.public(ctx, (transaction) => {
      return transaction.nftMint.count(query);
    });
  }
}
