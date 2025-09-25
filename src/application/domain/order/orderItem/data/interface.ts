import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";

export interface IOrderItemService {
  countReservedByProduct(
    ctx: IContext,
    productId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<number>;

  countSoldPendingMintByProduct(
    ctx: IContext,
    productId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<number>;
}

export interface IOrderItemRepository {
  count(
    ctx: IContext,
    where: Prisma.OrderItemWhereInput,
    tx?: Prisma.TransactionClient,
  ): Promise<number>;
}
