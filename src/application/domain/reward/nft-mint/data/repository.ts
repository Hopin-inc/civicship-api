import { injectable } from "tsyringe";
import { Prisma, NftMintStatus } from "@prisma/client";
import { IContext } from "@/types/server";
import { INftMintRepository } from "./interface";
import { nftMintSelectBase, PrismaNftMint } from "./type";
import logger from "@/infrastructure/logging";

@injectable()
export class NftMintRepository implements INftMintRepository {
  async count(
    ctx: IContext,
    where: Prisma.NftMintWhereInput,
    tx?: Prisma.TransactionClient,
  ): Promise<number> {
    if (tx) {
      return tx.nftMint.count({ where });
    }

    return ctx.issuer.public(ctx, (transaction) => transaction.nftMint.count({ where }));
  }

  async query(
    ctx: IContext,
    orderItemId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaNftMint[]> {
    if (tx) {
      return tx.nftMint.findMany({
        where: { orderItemId },
        select: nftMintSelectBase,
      });
    }
    return ctx.issuer.internal((dbTx) => {
      return dbTx.nftMint.findMany({
        where: { orderItemId },
        select: nftMintSelectBase,
      });
    });
  }

  async find(
    ctx: IContext,
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaNftMint | null> {
    if (tx) {
      return tx.nftMint.findUnique({ where: { id }, select: nftMintSelectBase });
    }
    return ctx.issuer.public(ctx, (dbTx) =>
      dbTx.nftMint.findUnique({ where: { id }, select: nftMintSelectBase }),
    );
  }

  async create(
    _ctx: IContext,
    data: Prisma.NftMintCreateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaNftMint> {
    try {
      return await tx.nftMint.create({ data, select: nftMintSelectBase });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("P2002") &&
        error.message.includes("order_item_id")
      ) {
        logger.warn("[NftMintRepository] Mint job already exists for order item", {
          orderItemId: (data as any).orderItem?.connect?.id,
        });

        const existing = await tx.nftMint.findFirst({
          where: { orderItemId: (data as any).orderItem?.connect?.id },
          select: nftMintSelectBase,
        });

        if (!existing) {
          throw error;
        }

        return existing;
      }
      throw error;
    }
  }

  async update(
    ctx: IContext,
    id: string,
    data: Prisma.NftMintUpdateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaNftMint> {
    if (tx) {
      return tx.nftMint.update({ where: { id }, data, select: nftMintSelectBase });
    }

    return ctx.issuer.internal((dbTx) =>
      dbTx.nftMint.update({ where: { id }, data, select: nftMintSelectBase }),
    );
  }

  async findAndLockPending(
    ctx: IContext,
    limit: number,
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaNftMint[]> {
    const queryFn = async (prisma: Prisma.TransactionClient) => {
      return prisma.$queryRaw<PrismaNftMint[]>`
        SELECT *
        FROM t_nft_mints
        WHERE status = ${NftMintStatus.QUEUED}
        ORDER BY created_at ASC
          LIMIT ${limit}
          FOR
        UPDATE SKIP LOCKED
      `;
    };

    if (tx) {
      return queryFn(tx);
    }

    return ctx.issuer.internal(queryFn);
  }
}
