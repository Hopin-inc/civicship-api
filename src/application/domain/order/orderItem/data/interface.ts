import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";

export interface IOrderItemReadService {
  getInventoryCounts(
    ctx: IContext,
    productId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<{ reserved: number; soldPendingMint: number }>;
}

export interface IOrderItemRepository {
  countByWhere(
    ctx: IContext,
    where: Prisma.OrderItemWhereInput,
    tx?: Prisma.TransactionClient,
  ): Promise<number>;
}
