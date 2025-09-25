import { Prisma, NftMintStatus } from "@prisma/client";
import { IContext } from "@/types/server";
import { PrismaNftMint } from "@/application/domain/reward/nft/nft-mint/data/type";

export interface INftMintRepository {
  count(
    ctx: IContext,
    where: Prisma.NftMintWhereInput,
    tx?: Prisma.TransactionClient,
  ): Promise<number>;
  findManyByOrderItemId(
    ctx: IContext,
    orderItemId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaNftMint[]>;
  create(
    ctx: IContext,
    data: Prisma.NftMintCreateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaNftMint>;
  update(
    ctx: IContext,
    id: string,
    data: Prisma.NftMintUpdateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaNftMint>;
  find(ctx: IContext, id: string): Promise<PrismaNftMint | null>;
  updateStatus(
    ctx: IContext,
    id: string,
    status: NftMintStatus,
    txHash?: string,
    error?: string,
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaNftMint>;
}
