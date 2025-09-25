import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { InventorySnapshot } from "../service";
import { PrismaProduct } from "@/application/domain/product/data/type";

export interface IProductService {
  findOrThrowForOrder(
    ctx: IContext,
    productId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaProduct>;

  calculateInventory(
    ctx: IContext,
    productId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<InventorySnapshot>;
}

export interface IProductRepository {
  findProduct(
    ctx: IContext,
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaProduct | null>;

  findManyByIdsForValidation(
    ctx: IContext,
    productIds: string[],
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaProduct[]>;
}
