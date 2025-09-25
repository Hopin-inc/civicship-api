import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { PrismaProductForValidation } from "./type";
import { InventorySnapshot } from "../service";

export interface IProductService {
  validateProductForOrder(
    ctx: IContext,
    productId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaProductForValidation>;

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
  ): Promise<PrismaProductForValidation | null>;

  findManyByIdsForValidation(
    ctx: IContext,
    productIds: string[],
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaProductForValidation[]>;
}
