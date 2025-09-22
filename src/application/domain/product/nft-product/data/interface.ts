import { Prisma } from '@prisma/client';
import { IContext } from '@/types/server';
import { NftProductForService } from './type';

export interface INftProductRepository {
  findByProductId(ctx: IContext, productId: string): Promise<NftProductForService | null>;
  
  findByExternalRef(ctx: IContext, externalRef: string): Promise<NftProductForService | null>;
  
  update(
    ctx: IContext,
    id: string,
    data: Prisma.NftProductUpdateInput,
    tx: Prisma.TransactionClient
  ): Promise<NftProductForService>;
}
