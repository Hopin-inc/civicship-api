import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { injectable } from "tsyringe";
import { INftTokenRepository } from "./interface";

@injectable()
export default class NftTokenRepository implements INftTokenRepository {
  async upsert(
    ctx: IContext,
    data: { address: string; name?: string | null; symbol?: string | null; type: string; json?: any },
    tx: Prisma.TransactionClient,
  ) {
    return tx.nftToken.upsert({
      where: { address: data.address },
      update: {
        name: data.name,
        symbol: data.symbol,
        type: data.type,
        json: data.json,
      },
      create: {
        address: data.address,
        name: data.name ?? null,
        symbol: data.symbol ?? null,
        type: data.type,
        json: data.json ?? null,
      },
      select: {
        id: true,
        address: true,
      },
    });
  }
}
