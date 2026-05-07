import { NftChain, NftVendor, Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { injectable } from "tsyringe";
import { INftTokenRepository } from "./interface";
import { nftTokenSelect, PrismaNftToken } from "./type";

@injectable()
export default class NftTokenRepository implements INftTokenRepository {
  async query(
    ctx: IContext,
    where: Prisma.NftTokenWhereInput,
    orderBy: Prisma.NftTokenOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ): Promise<PrismaNftToken[]> {
    return ctx.issuer.public(ctx, async (tx) => {
      return tx.nftToken.findMany({
        where,
        select: nftTokenSelect,
        orderBy,
        take,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      });
    });
  }

  async count(ctx: IContext, where: Prisma.NftTokenWhereInput): Promise<number> {
    return ctx.issuer.public(ctx, (tx) => tx.nftToken.count({ where }));
  }

  async findById(ctx: IContext, id: string): Promise<PrismaNftToken | null> {
    return ctx.issuer.public(ctx, async (tx) => {
      return tx.nftToken.findUnique({
        where: { id },
        select: nftTokenSelect,
      });
    });
  }

  async upsert(
    ctx: IContext,
    data: {
      address: string;
      name?: string | null;
      symbol?: string | null;
      type: string;
      json?: Record<string, unknown>;
      issuedByVendor?: NftVendor;
      chain?: NftChain;
    },
    tx: Prisma.TransactionClient,
  ) {
    return tx.nftToken.upsert({
      where: { address: data.address },
      update: {
        name: data.name,
        symbol: data.symbol,
        type: data.type,
        json: data.json,
        ...(data.issuedByVendor !== undefined ? { issuedByVendor: data.issuedByVendor } : {}),
        ...(data.chain !== undefined ? { chain: data.chain } : {}),
      },
      create: {
        address: data.address,
        name: data.name ?? null,
        symbol: data.symbol ?? null,
        type: data.type,
        json: data.json ?? null,
        issuedByVendor: data.issuedByVendor ?? null,
        chain: data.chain ?? null,
      },
      select: {
        id: true,
        address: true,
        communityId: true,
      },
    });
  }

  async findByAddress(
    ctx: IContext,
    address: string,
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaNftToken | null> {
    if (tx) {
      return tx.nftToken.findUnique({
        where: { address },
        select: nftTokenSelect,
      });
    }

    return ctx.issuer.internal(async (t) => {
      return t.nftToken.findUnique({
        where: { address },
        select: nftTokenSelect,
      });
    });
  }

  async findManyByAddresses(ctx: IContext, addresses: string[]) {
    if (addresses.length === 0) {
      return [];
    }

    return ctx.issuer.internal(async (t) => {
      return t.nftToken.findMany({
        where: { address: { in: addresses } },
        select: {
          id: true,
          address: true,
          name: true,
          symbol: true,
          type: true,
          updatedAt: true,
        },
      });
    });
  }
}
