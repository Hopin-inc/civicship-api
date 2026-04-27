import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { PrismaNftToken } from "@/application/domain/account/nft-token/data/type";

export interface INftTokenRepository {
  upsert(
    ctx: IContext,
    data: {
      address: string;
      name?: string | null;
      symbol?: string | null;
      type: string;
      json?: Record<string, unknown>;
    },
    tx: Prisma.TransactionClient,
  ): Promise<{ id: string; address: string; communityId: string | null }>;

  findByAddress(
    ctx: IContext,
    address: string,
    tx?: Prisma.TransactionClient,
  ): Promise<{
    id: string;
    address: string;
    name: string | null;
    symbol: string | null;
    type: string;
    communityId: string | null;
    updatedAt: Date | null;
  } | null>;

  findManyByAddresses(
    ctx: IContext,
    addresses: string[],
  ): Promise<
    Array<{
      id: string;
      address: string;
      name: string | null;
      symbol: string | null;
      type: string;
      updatedAt: Date | null;
    }>
  >;

  query(
    ctx: IContext,
    where: Prisma.NftTokenWhereInput,
    orderBy: Prisma.NftTokenOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ): Promise<PrismaNftToken[]>;

  count(ctx: IContext, where: Prisma.NftTokenWhereInput): Promise<number>;

  findById(ctx: IContext, id: string): Promise<PrismaNftToken | null>;
}
