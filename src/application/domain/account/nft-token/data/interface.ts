import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";

export interface INftTokenRepository {
  upsert(
    ctx: IContext,
    data: { address: string; name?: string | null; symbol?: string | null; type: string; json?: Record<string, unknown> },
    tx: Prisma.TransactionClient,
  ): Promise<{ id: string; address: string }>;
  
  findByAddress(
    ctx: IContext,
    address: string,
    tx?: Prisma.TransactionClient,
  ): Promise<{ id: string; address: string; name: string | null; symbol: string | null; type: string; updatedAt: Date | null } | null>;

  findManyByAddresses(
    ctx: IContext,
    addresses: string[],
  ): Promise<Array<{ id: string; address: string; name: string | null; symbol: string | null; type: string; updatedAt: Date | null }>>;
}
