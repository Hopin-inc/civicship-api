import { IContext } from "@/types/server";
import { Prisma, NftInstance, NftInstanceStatus } from "@prisma/client";
import { injectable } from "tsyringe";
import INftInstanceRepository from "@/application/domain/account/nft-instance/data/interface";
import { NftInstanceWithRelations } from "@/application/domain/account/nft-instance/data/type";
import logger from "@/infrastructure/logging";

@injectable()
export default class NftInstanceRepository implements INftInstanceRepository {
  async query(
    ctx: IContext,
    where: Prisma.NftInstanceWhereInput,
    orderBy: Prisma.NftInstanceOrderByWithRelationInput[],
    take: number,
    cursor?: string,
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

  async findAndReserveInstance(
    ctx: IContext,
    communityId: string,
    productId: string,
  ): Promise<NftInstance | null> {
    return ctx.issuer.internal(async (tx) => {
      const rows = await tx.$queryRaw<NftInstance[]>`
        UPDATE t_nft_instances
        SET status = 'RESERVED'::"NftInstanceStatus"
        WHERE id = (
          SELECT id FROM t_nft_instances
          WHERE community_id = ${communityId}
            AND product_id = ${productId}
            AND status = 'STOCK'::"NftInstanceStatus"
          ORDER BY sequence_num ASC
          FOR UPDATE SKIP LOCKED
          LIMIT 1
        )
        RETURNING *
      `;
      
      const reservedInstance = rows[0] ?? null;
      if (reservedInstance) {
        logger.debug("[NftInstanceRepository] Reserved NFT instance", {
          instanceId: reservedInstance.id,
          communityId,
          productId,
          sequenceNum: reservedInstance.sequenceNum,
        });
      }
      
      return reservedInstance;
    });
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

    logger.debug("[NftInstanceRepository] Released NFT instance reservation", {
      instanceId,
    });
  }

  async updateStatus(
    ctx: IContext,
    instanceId: string,
    status: NftInstanceStatus,
    tx?: Prisma.TransactionClient,
  ): Promise<NftInstance> {
    const updateFn = async (prisma: Prisma.TransactionClient) => {
      const updatedInstance = await prisma.nftInstance.update({
        where: { id: instanceId },
        data: { status },
      });

      logger.debug("[NftInstanceRepository] Updated NFT instance status", {
        instanceId,
        status,
      });

      return updatedInstance;
    };

    if (tx) {
      return updateFn(tx);
    }

    return ctx.issuer.internal(updateFn);
  }

  async count(ctx: IContext, where: Prisma.NftInstanceWhereInput): Promise<number> {
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
