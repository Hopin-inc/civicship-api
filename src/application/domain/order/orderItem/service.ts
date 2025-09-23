import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { injectable, inject } from "tsyringe";
import { OrderItemRepository } from "./data/repository";

export interface IOrderItemReadService {
  getInventoryCounts(
    ctx: IContext,
    productId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<{ reserved: number; soldPendingMint: number; minted: number }>;
}

@injectable()
export class OrderItemReadService implements IOrderItemReadService {
  constructor(
    @inject("OrderItemRepository") private readonly repo: OrderItemRepository,
  ) {}

  async getInventoryCounts(ctx: IContext, productId: string, tx?: Prisma.TransactionClient) {
    const [reserved, soldPendingMint, minted] = await Promise.all([
      this.repo.countReservedForProduct(ctx, productId, tx),
      this.repo.countSoldPendingMintForProduct(ctx, productId, tx),
      this.repo.countMintedForProduct(ctx, productId, tx),
    ]);
    return { reserved, soldPendingMint, minted };
  }
}
