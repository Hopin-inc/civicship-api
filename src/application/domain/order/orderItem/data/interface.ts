import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { OrderItemWithRelations } from "./type";

export interface IOrderItemRepository {
  findById(
    ctx: IContext,
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<OrderItemWithRelations | null>;

  create(
    ctx: IContext,
    data: Prisma.OrderItemCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<OrderItemWithRelations>;

  countReservedForProduct( // PENDING 注文 (= 予約)
    ctx: IContext,
    productId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<number>;

  countSoldPendingMintForProduct( // PAID & ミント未完了（SUBMITTED）
    ctx: IContext,
    productId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<number>;

  countMintedForProduct( // MINTED 完了数
    ctx: IContext,
    productId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<number>;
}
