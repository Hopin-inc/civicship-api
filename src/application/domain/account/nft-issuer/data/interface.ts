import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";

export interface INftIssuerRepository {
  find(ctx: IContext, address: string): Promise<{ address: string; name: string | null } | null>;
  upsert(
    ctx: IContext,
    address: string,
    tx: Prisma.TransactionClient,
  ): Promise<{ address: string; name: string | null }>;
}
