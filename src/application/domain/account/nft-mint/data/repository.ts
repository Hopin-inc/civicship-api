import { injectable } from "tsyringe";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { INftMintRepository } from "./interface";
import { NftMintBase, nftMintSelectBase } from "./type";

@injectable()
export class NftMintRepository implements INftMintRepository {
  async create(_ctx: IContext, data: Prisma.NftMintCreateInput, tx: Prisma.TransactionClient): Promise<NftMintBase> {
    return tx.nftMint.create({ data, ...nftMintSelectBase });
  }

  async update(_ctx: IContext, id: string, data: Prisma.NftMintUpdateInput, tx: Prisma.TransactionClient): Promise<NftMintBase> {
    return tx.nftMint.update({ where: { id }, data, ...nftMintSelectBase });
  }

  async find(ctx: IContext, id: string): Promise<NftMintBase | null> {
    return ctx.issuer.public(ctx, (prismaTx) =>
      prismaTx.nftMint.findUnique({ where: { id }, ...nftMintSelectBase }),
    );
  }

  async countByPolicy(ctx: IContext, policyId: string): Promise<number> {
    return ctx.issuer.public(ctx, (prismaTx) =>
      prismaTx.nftMint.count({ where: { policyId } }),
    );
  }
}
