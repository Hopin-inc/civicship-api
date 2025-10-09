import { IContext } from "@/types/server";
import { NftInstance, NftInstanceStatus, Prisma } from "@prisma/client";
import { injectable } from "tsyringe";
import INftInstanceRepository from "@/application/domain/account/nft-instance/data/interface";
import {
  nftInstanceInclude,
  PrismaNftInstance,
} from "@/application/domain/account/nft-instance/data/type";

@injectable()
export default class NftInstanceRepository implements INftInstanceRepository {
  async query(
    ctx: IContext,
    where: Prisma.NftInstanceWhereInput,
    orderBy: Prisma.NftInstanceOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ): Promise<PrismaNftInstance[]> {
    return ctx.issuer.public(ctx, async (tx) => {
      return tx.nftInstance.findMany({
        where,
        include: nftInstanceInclude,
        orderBy,
        take,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      });
    });
  }

  async findAndReserveInstance(
    ctx: IContext,
    communityId: string,
    productId: string,
    tx: Prisma.TransactionClient,
  ): Promise<NftInstance | null> {
    const rows = await tx.$queryRaw<NftInstance[]>`
      UPDATE t_nft_instances
      SET status = 'RESERVED'::"NftInstanceStatus"
      WHERE id = (
        SELECT ni.id
        FROM t_nft_instances ni
        JOIN t_nft_products np ON np.id = ni.nft_product_id
        WHERE ni.community_id = ${communityId}
        AND np.product_id = ${productId}
        AND ni.status = 'STOCK'::"NftInstanceStatus"
        ORDER BY ni.sequence_num ASC
        FOR UPDATE SKIP LOCKED
        LIMIT 1
        )
        RETURNING *
    `;

    return rows[0] ?? null;
  }

  async releaseReservation(
    ctx: IContext,
    instanceId: string,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    await tx.nftInstance.update({
      where: { id: instanceId },
      data: { status: NftInstanceStatus.STOCK },
    });
  }

  async updateStatus(
    ctx: IContext,
    instanceId: string,
    status: NftInstanceStatus,
    tx?: Prisma.TransactionClient,
  ): Promise<NftInstance> {
    if (tx) {
      return tx.nftInstance.update({
        where: { id: instanceId },
        data: { status },
      });
    }

    return ctx.issuer.internal((prisma) =>
      prisma.nftInstance.update({
        where: { id: instanceId },
        data: { status },
      }),
    );
  }

  async count(ctx: IContext, where: Prisma.NftInstanceWhereInput): Promise<number> {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.nftInstance.count({
        where,
      });
    });
  }

  async findById(ctx: IContext, id: string): Promise<PrismaNftInstance | null> {
    return ctx.issuer.public(ctx, async (tx) => {
      return tx.nftInstance.findUnique({
        where: { id },
        include: nftInstanceInclude,
      });
    });
  }

  async upsert(
    ctx: IContext,
    data: {
      instanceId: string;
      name?: string | null;
      description?: string | null;
      imageUrl?: string | null;
      json: unknown;
      nftWalletId: string;
      nftTokenId: string;
    },
    nftProductId: string,
    tx: Prisma.TransactionClient,
  ) {
    return tx.nftInstance.upsert({
      where: {
        nftProductId_instanceId: {
          nftProductId,
          instanceId: data.instanceId,
        },
      },
      update: {
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
        json: data.json,
      },
      create: {
        instanceId: data.instanceId,
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
        json: data.json,
        nftWalletId: data.nftWalletId,
      },
      select: {
        id: true,
      },
    });
  }

  async findReservedByProduct(
    ctx: IContext,
    nftProductId: string,
    quantity: number,
    tx: Prisma.TransactionClient,
  ): Promise<NftInstance[]> {
    return tx.nftInstance.findMany({
      where: {
        nftProductId,
        status: NftInstanceStatus.RESERVED,
        communityId: ctx.communityId,
      },
      take: quantity,
      orderBy: { sequenceNum: "asc" },
    });
  }

  async findByIdWithTransaction(
    ctx: IContext,
    instanceId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<{ id: string } | null> {
    if (tx) {
      return tx.nftInstance.findFirst({
        where: { id: instanceId },
        select: { id: true },
      });
    }
    return ctx.issuer.public(ctx, (prisma) =>
      prisma.nftInstance.findFirst({
        where: { id: instanceId },
        select: { id: true },
      }),
    );
  }

  async markAsMinting(
    ctx: IContext,
    nftInstanceId: string,
    mintId: string,
    walletId: string,
    tx: Prisma.TransactionClient,
  ): Promise<NftInstance> {
    return tx.nftInstance.update({
      where: { id: nftInstanceId },
      data: {
        nftMints: {
          connect: { id: mintId },
        },
        nftWalletId: walletId,
        status: NftInstanceStatus.MINTING,
      },
    });
  }
}
