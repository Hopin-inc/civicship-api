import { Prisma, NftInstance, NftInstanceStatus } from "@prisma/client";
import { IContext } from "@/types/server";
import { PrismaNftInstance } from "@/application/domain/account/nft-instance/data/type";

export default interface INftInstanceRepository {
  query(
    ctx: IContext,
    where: Prisma.NftInstanceWhereInput,
    orderBy: Prisma.NftInstanceOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ): Promise<PrismaNftInstance[]>;

  findAndReserveInstance(
    ctx: IContext,
    communityId: string,
    productId: string,
    tx: Prisma.TransactionClient,
  ): Promise<NftInstance | null>;

  releaseReservation(
    ctx: IContext,
    instanceId: string,
    tx: Prisma.TransactionClient,
  ): Promise<void>;

  updateStatus(
    ctx: IContext,
    instanceId: string,
    status: NftInstanceStatus,
    tx?: Prisma.TransactionClient,
  ): Promise<NftInstance>;

  findById(ctx: IContext, id: string): Promise<PrismaNftInstance | null>;

  count(ctx: IContext, where: Prisma.NftInstanceWhereInput): Promise<number>;

  upsert(
    ctx: IContext,
    data: {
      instanceId: string;
      name?: string | null;
      description?: string | null;
      imageUrl?: string | null;
      json: Record<string, unknown>;
      nftWalletId: string;
      nftTokenId: string;
    },
    nftTokenId: string,
    tx: Prisma.TransactionClient,
  ): Promise<{ id: string }>;

  findReservedByProduct(
    ctx: IContext,
    productId: string,
    quantity: number,
    tx: Prisma.TransactionClient,
  ): Promise<NftInstance[]>;

  findByIdWithTransaction(
    ctx: IContext,
    instanceId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<{ id: string } | null>;
}
