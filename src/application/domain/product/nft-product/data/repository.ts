import { Prisma } from '@prisma/client';
import { IContext } from '@/types/server';
import { injectable } from 'tsyringe';
import { INftProductRepository } from './interface';
import { nftProductIncludeForService } from './type';

@injectable()
export class NftProductRepository implements INftProductRepository {
  async findByProductId(ctx: IContext, productId: string) {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.nftProduct.findFirst({
        where: { productId },
        include: nftProductIncludeForService.include,
      });
    });
  }

  async findByExternalRef(ctx: IContext, externalRef: string) {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.nftProduct.findFirst({
        where: { externalRef },
        include: nftProductIncludeForService.include,
      });
    });
  }

  async update(
    ctx: IContext,
    id: string,
    data: Prisma.NftProductUpdateInput,
    tx: Prisma.TransactionClient
  ) {
    return tx.nftProduct.update({
      where: { id },
      data,
      include: nftProductIncludeForService.include,
    });
  }
}
