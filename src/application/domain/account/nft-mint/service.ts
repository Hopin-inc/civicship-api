import { inject, injectable } from "tsyringe";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { INftMintRepository } from "./data/interface";
import { NftMintBase, nftMintSelectBase } from "./data/type";
import NftMintConverter from "./data/converter";
import { IMintAdapter } from "./mint/adapter";
import {
  InvalidReceiverAddressError,
  NetworkMismatchError,
  InvalidProductKeyError,
  AssetNameTooLongError,
} from "@/errors/graphql";

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
    this.validateProductKey(p.productKey);
    this.validateReceiverAddress(p.receiver);
    
    const count = await this.repo.countByPolicy(ctx, p.policyId);
    const assetName = `${p.productKey}-${String(count + 1).padStart(4, "0")}`;
    
    this.validateAssetNameLength(assetName);
    
    return this.repo.create(ctx, this.converter.buildMintCreate({
      policyId: p.policyId,
      assetName,
      receiver: p.receiver,
    }), tx);
  }

  private validateProductKey(productKey: string): void {
    const pattern = /^[a-z0-9-]{1,24}$/;
    if (!pattern.test(productKey)) {
      throw new InvalidProductKeyError(productKey);
    }
  }

  private validateReceiverAddress(receiver: string): void {
    if (!receiver.startsWith("addr_test") && !receiver.startsWith("addr1")) {
      throw new InvalidReceiverAddressError(receiver);
    }

    const networkId = process.env.CARDANO_NETWORK_ID || "0";
    const expectedNetwork = networkId === "1" ? "mainnet" : "testnet";
    
    if (expectedNetwork === "testnet" && !receiver.startsWith("addr_test")) {
      throw new NetworkMismatchError(receiver, "testnet");
    }
    
    if (expectedNetwork === "mainnet" && !receiver.startsWith("addr1")) {
      throw new NetworkMismatchError(receiver, "mainnet");
    }
  }

  private validateAssetNameLength(assetName: string): void {
    const bytes = Buffer.byteLength(assetName, 'utf8');
    if (bytes > 32) {
      throw new AssetNameTooLongError(assetName, bytes);
    }
  }

  async mintNow(
    ctx: IContext,
    mintId: string,
  ): Promise<string> {
    const mint = await ctx.issuer.internal(async (tx) => {
      return tx.nftMint.findUnique({ where: { id: mintId }, ...nftMintSelectBase });
    });
    
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
