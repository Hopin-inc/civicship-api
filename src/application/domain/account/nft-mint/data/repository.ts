import { injectable } from "tsyringe";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { INftMintRepository } from "./interface";
import * as T from "./type";

@injectable()
export class NftMintRepository implements INftMintRepository {
  async create(_ctx: IContext, data: Prisma.NftMintCreateInput, tx: Prisma.TransactionClient) {
    return tx.nftMint.create({ data, ...T.nftMintSelectBase });
  }

  async update(_ctx: IContext, id: string, data: Prisma.NftMintUpdateInput, tx: Prisma.TransactionClient) {
    return tx.nftMint.update({ where: { id }, data, ...T.nftMintSelectBase });
  }

  async find(ctx: IContext, id: string) {
    return ctx.issuer.public(ctx, (prismaTx) =>
      prismaTx.nftMint.findUnique({ where: { id }, ...T.nftMintSelectBase }),
    );
  }

  async countByPolicy(ctx: IContext, policyId: string) {
    return ctx.issuer.public(ctx, (prismaTx) =>
      prismaTx.nftMint.count({ where: { policyId } }),
    );
  }
}
