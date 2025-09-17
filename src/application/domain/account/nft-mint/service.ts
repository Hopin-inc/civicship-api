import { inject, injectable } from "tsyringe";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { INftMintRepository } from "./data/interface";
import { NftMintBase, nftMintSelectBase } from "./data/type";
import NftMintConverter from "./data/converter";
import { IMintAdapter } from "./mint/adapter";

@injectable()
export default class NftMintService {
  constructor(
    @inject("NftMintRepository") private readonly repo: INftMintRepository,
    @inject("MintAdapter") private readonly adapter: IMintAdapter,
    @inject("NftMintConverter") private readonly converter: NftMintConverter,
  ) {}

  async queueMint(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    p: { policyId: string; productKey: string; receiver: string },
  ): Promise<NftMintBase> {
    const count = await this.repo.countByPolicy(ctx, p.policyId);
    const assetName = `${p.productKey}-${String(count + 1).padStart(4, "0")}`;
    return this.repo.create(ctx, this.converter.buildMintCreate({
      policyId: p.policyId,
      assetName,
      receiver: p.receiver,
    }), tx);
  }

  async mintNow(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    mintId: string,
  ): Promise<string> {
    const mint = await tx.nftMint.findUnique({ where: { id: mintId }, ...nftMintSelectBase });
    if (!mint) throw new Error("Mint not found");

    const { txHash } = await this.adapter.mintOne({
      policyId: mint.policyId,
      assetName: mint.assetName,
      receiver: mint.receiver,
    });
    return txHash;
  }

  markMinted(ctx: IContext, tx: Prisma.TransactionClient, id: string, txHash: string) {
    return this.repo.update(ctx, id, this.converter.buildMarkMinted({ txHash }), tx);
  }

  markFailed(ctx: IContext, tx: Prisma.TransactionClient, id: string, error: string) {
    return this.repo.update(ctx, id, this.converter.buildMarkFailed({ error }), tx);
  }
}
