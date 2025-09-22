import { Prisma, NftMintStatus } from '@prisma/client';
import { IContext } from '@/types/server';
import { NftMintForPresenter, NftMintForService } from './type';

export interface INftMintRepository {
  find(ctx: IContext, id: string): Promise<NftMintForPresenter | null>;
  
  findByOrderItemId(ctx: IContext, orderItemId: string): Promise<NftMintForService | null>;
  
  create(
    ctx: IContext,
    data: Prisma.NftMintCreateInput,
    tx: Prisma.TransactionClient
  ): Promise<NftMintForService>;
  
  update(
    ctx: IContext,
    id: string,
    data: Prisma.NftMintUpdateInput,
    tx: Prisma.TransactionClient
  ): Promise<NftMintForService>;
  
  updateStatus(
    ctx: IContext,
    id: string,
    status: NftMintStatus,
    txHash?: string,
    error?: string,
    tx?: Prisma.TransactionClient
  ): Promise<NftMintForService>;
}
