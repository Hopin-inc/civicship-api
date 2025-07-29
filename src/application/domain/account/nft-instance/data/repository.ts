import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { injectable } from "tsyringe";
import { INftInstanceRepository } from "./interface";

@injectable()
export default class NftInstanceRepository implements INftInstanceRepository {
  async upsert(
    ctx: IContext,
    data: { instanceId: string; name?: string | null; description?: string | null; imageUrl?: string | null; json: any; nftWalletId: string; nftTokenId: string },
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
