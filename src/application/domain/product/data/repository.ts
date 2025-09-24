import { injectable } from 'tsyringe';
import { Prisma } from '@prisma/client';
import { IContext } from '@/types/server';
import { IProductRepository } from './interface';
import { productSelectForValidation, PrismaProductForValidation } from './type';

@injectable()
export default class ProductRepository implements IProductRepository {
  async findByIdForValidation(
    ctx: IContext,
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<PrismaProductForValidation | null> {
    if (tx) {
      return tx.product.findUnique({
        where: { id },
        select: productSelectForValidation,
      });
    }
    return ctx.issuer.public(ctx, (transaction) => {
      return transaction.product.findUnique({
        where: { id },
        select: productSelectForValidation,
      });
    });
  }

  async findManyByIdsForValidation(
    ctx: IContext, 
    productIds: string[], 
    tx?: Prisma.TransactionClient
  ): Promise<PrismaProductForValidation[]> {
    if (tx) {
      return tx.product.findMany({ 
        where: { id: { in: productIds } }, 
        select: productSelectForValidation 
      });
    }
    return ctx.issuer.public(ctx, (transaction) =>
      transaction.product.findMany({ 
        where: { id: { in: productIds } }, 
        select: productSelectForValidation 
      }),
    );
  }
}
