import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { injectable } from "tsyringe";
import { INftIssuerRepository } from "./interface";

@injectable()
export default class NftIssuerRepository implements INftIssuerRepository {
  async find(ctx: IContext, address: string) {
    return ctx.issuer.public(ctx, (client) => {
      return client.nftIssuer.findUnique({
        where: { address },
        select: { address: true, name: true },
      });
    });
  }

  async upsert(ctx: IContext, address: string, tx: Prisma.TransactionClient) {
    return tx.nftIssuer.upsert({
      where: { address },
      update: {},
      create: { address, name: null },
      select: { address: true, name: true },
    });
  }
}
