import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";

export interface INftInstanceRepository {
  upsert(
    ctx: IContext,
    data: { instanceId: string; name?: string | null; description?: string | null; imageUrl?: string | null; json: any; nftWalletId: string; nftTokenId: string },
    tx: Prisma.TransactionClient,
  ): Promise<{ id: string }>;
}
