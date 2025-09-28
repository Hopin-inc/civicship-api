import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";
import { injectable } from "tsyringe";
import INftInstanceRepository from "@/application/domain/account/nft-instance/data/interface";
import { NftInstanceWithRelations } from "@/application/domain/account/nft-instance/data/type";

@injectable()
export default class NftInstanceRepository implements INftInstanceRepository {
  async query(
    ctx: IContext,
    where: Prisma.NftInstanceWhereInput,
    orderBy: Prisma.NftInstanceOrderByWithRelationInput[],
    take: number,
    cursor?: string
  ): Promise<NftInstanceWithRelations[]> {
    return ctx.issuer.public(ctx, async (tx) => {
      const result = await tx.nftInstance.findMany({
        where,
        include: {
          nftToken: true,
          nftWallet: true,
        },
        orderBy,
        take,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      });
      return result as NftInstanceWithRelations[];
    });
  }

  async count(
    ctx: IContext,
    where: Prisma.NftInstanceWhereInput
  ): Promise<number> {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.nftInstance.count({
        where,
      });
    });
  }

  async findById(ctx: IContext, id: string): Promise<NftInstanceWithRelations | null> {
    return ctx.issuer.public(ctx, async (tx) => {
      const result = await tx.nftInstance.findUnique({
        where: { id },
        include: {
          nftToken: true,
          nftWallet: true,
        },
      });
      return result as NftInstanceWithRelations | null;
    });
  }

  async findAvailableInstance(
    ctx: IContext,
    communityId: string,
    productId: string,
  ): Promise<NftInstanceWithRelations | null> {
    return ctx.issuer.public(ctx, async (prisma) => {
      const result = await prisma.nftInstance.findFirst({
        where: {
          communityId,
          nftMintId: null,
        },
        include: {
          nftToken: true,
          nftWallet: true,
        },
        orderBy: { createdAt: 'asc' },
      });
      return result as NftInstanceWithRelations | null;
    });
  }

  async upsert(
    ctx: IContext,
    data: { instanceId: string; name?: string | null; description?: string | null; imageUrl?: string | null; json: unknown; nftWalletId: string; nftTokenId: string },
    tx: Prisma.TransactionClient,
  ) {
    return tx.nftInstance.upsert({
      where: {
        nftWalletId_instanceId: {
          nftWalletId: data.nftWalletId,
          instanceId: data.instanceId,
        },
      },
      update: {
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
        json: data.json,
        nftTokenId: data.nftTokenId,
      },
      create: {
        instanceId: data.instanceId,
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
        json: data.json,
        nftWalletId: data.nftWalletId,
        nftTokenId: data.nftTokenId,
      },
      select: {
        id: true,
      },
    });
  }
}
