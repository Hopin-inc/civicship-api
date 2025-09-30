import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { PrismaProduct } from "@/application/domain/product/data/type";

export interface IProductService {
  findOrThrowForOrder(
    ctx: IContext,
    productId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaProduct>;
}

export interface IProductRepository {
  query(
    ctx: IContext,
    productIds: string[],
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaProduct[]>;

  find(
    ctx: IContext,
    productId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaProduct | null>;

  findMaxSupplyById(
    ctx: IContext,
    productId: string,
    tx: Prisma.TransactionClient,
  ): Promise<{ maxSupply: number | null } | null>;

  calculateInventoryAtomic(
    ctx: IContext,
    productId: string,
    tx: Prisma.TransactionClient,
  ): Promise<{
    maxSupply: number | null;
    reserved: number;
    soldPendingMint: number;
    minted: number;
  } | null>;
}
