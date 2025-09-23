import { Prisma } from '@prisma/client';
import { IContext } from '@/types/server';
import { PrismaProductForValidation } from './type';

export interface IProductService {
  findProductForValidation(
    ctx: IContext,
    productId: string,
    tx?: Prisma.TransactionClient
  ): Promise<PrismaProductForValidation | null>;
  
  validateProductForOrder(
    ctx: IContext,
    productId: string,
    tx?: Prisma.TransactionClient
  ): Promise<PrismaProductForValidation>;
}

export interface IProductRepository {
  findByIdForValidation(
    ctx: IContext,
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<PrismaProductForValidation | null>;
}
