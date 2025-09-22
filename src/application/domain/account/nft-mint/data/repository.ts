import { Prisma, NftMintStatus } from '@prisma/client';
import { IContext } from '@/types/server';
import { injectable } from 'tsyringe';
import { INftMintRepository } from './interface';
import { nftMintIncludeForService } from './type';

@injectable()
export class NftMintRepository implements INftMintRepository {
  async find(ctx: IContext, id: string) {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.nftMint.findUnique({
        where: { id },
      });
    });
  }

  async findByOrderItemId(ctx: IContext, orderItemId: string) {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.nftMint.findFirst({
        where: { orderItemId },
        include: nftMintIncludeForService.include,
      });
    });
  }

  async create(ctx: IContext, data: Prisma.NftMintCreateInput, tx: Prisma.TransactionClient) {
    return tx.nftMint.create({
      data,
      include: nftMintIncludeForService.include,
    });
  }

  async update(
    ctx: IContext,
    id: string,
    data: Prisma.NftMintUpdateInput,
    tx: Prisma.TransactionClient
  ) {
    return tx.nftMint.update({
      where: { id },
      data,
      include: nftMintIncludeForService.include,
    });
  }

  async updateStatus(
    ctx: IContext,
    id: string,
    status: NftMintStatus,
    txHash?: string,
    error?: string,
    tx?: Prisma.TransactionClient
  ) {
    const updateData: Prisma.NftMintUpdateInput = {
      status,
      txHash: txHash || undefined,
      error: error || null,
    };

    if (tx) {
      return tx.nftMint.update({
        where: { id },
        data: updateData,
        include: nftMintIncludeForService.include,
      });
    }

    return ctx.issuer.internal(async (transaction) => {
      return transaction.nftMint.update({
        where: { id },
        data: updateData,
        include: nftMintIncludeForService.include,
      });
    });
  }
}
