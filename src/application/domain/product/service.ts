import { injectable, inject } from 'tsyringe';
import { Prisma } from '@prisma/client';
import { IContext } from '@/types/server';
import { IProductService } from './data/interface';
import ProductRepository from './data/repository';
import { PrismaProductForValidation } from './data/type';

@injectable()
export default class ProductService implements IProductService {
  constructor(
    @inject("ProductRepository") private readonly repository: ProductRepository,
  ) {}

  async findProductForValidation(
    ctx: IContext,
    productId: string,
    tx?: Prisma.TransactionClient
  ): Promise<PrismaProductForValidation | null> {
    return this.repository.findByIdForValidation(ctx, productId, tx);
  }

  async validateProductForOrder(
    ctx: IContext,
    productId: string,
    tx?: Prisma.TransactionClient
  ): Promise<PrismaProductForValidation> {
    const product = await this.findProductForValidation(ctx, productId, tx);
    
    if (!product) {
      throw new Error(`Product not found: ${productId}`);
    }
    
    if (product.type !== 'NFT') {
      throw new Error(`Product is not an NFT: ${productId}`);
    }
    
    if (!product.nftProduct) {
      throw new Error(`NFT product not found for product: ${productId}`);
    }
    
    if (!product.nftProduct?.externalRef) {
      throw new Error(`NFT product missing externalRef: ${productId}`);
    }
    
    return product;
  }
}
