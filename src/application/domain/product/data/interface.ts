import { Prisma } from '@prisma/client';
import { IContext } from '@/types/server';
import { PrismaProductForValidation } from './type';
import { InventorySnapshot, ProductSnapshot } from '../service';

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

  getForOrder(
    ctx: IContext,
    productIds: string[],
    tx?: Prisma.TransactionClient
  ): Promise<ProductSnapshot[]>;

  calculateInventory(
    ctx: IContext,
    productId: string,
    tx?: Prisma.TransactionClient
  ): Promise<InventorySnapshot>;

  reserveInventory(
    ctx: IContext,
    items: Array<{ productId: string; quantity: number }>,
    tx: Prisma.TransactionClient
  ): Promise<void>;
}

export interface IProductRepository {
  findByIdForValidation(
    ctx: IContext,
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<PrismaProductForValidation | null>;

  findManyByIdsForValidation(
    ctx: IContext,
    productIds: string[],
    tx?: Prisma.TransactionClient
  ): Promise<PrismaProductForValidation[]>;
}
