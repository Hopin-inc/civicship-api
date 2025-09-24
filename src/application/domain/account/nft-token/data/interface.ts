import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";

export interface INftTokenRepository {
  upsert(
    ctx: IContext,
    data: { address: string; name?: string | null; symbol?: string | null; type: string; json?: Record<string, unknown> },
    tx: Prisma.TransactionClient,
  ): Promise<{ id: string; address: string }>;
}
