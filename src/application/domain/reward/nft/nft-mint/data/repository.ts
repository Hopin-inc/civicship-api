import { injectable } from "tsyringe";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { INftMintRepository } from "./interface";
import { nftMintSelectBase, PrismaNftMint } from "./type";

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

  async findManyByOrderItemId(
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

  async find(ctx: IContext, id: string): Promise<PrismaNftMint | null> {
    return ctx.issuer.public(ctx, (prismaTx) =>
      prismaTx.nftMint.findUnique({ where: { id }, select: nftMintSelectBase }),
    );
  }

  async create(
    _ctx: IContext,
    data: Prisma.NftMintCreateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaNftMint> {
    return tx.nftMint.create({ data, select: nftMintSelectBase });
  }

  async update(
    _ctx: IContext,
    id: string,
    data: Prisma.NftMintUpdateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaNftMint> {
    return tx.nftMint.update({ where: { id }, data, select: nftMintSelectBase });
  }
}
