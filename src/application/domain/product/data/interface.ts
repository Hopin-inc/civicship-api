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
  find(
    ctx: IContext,
    productId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaProduct | null>;
}
