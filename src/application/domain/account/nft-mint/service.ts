import { inject, injectable } from "tsyringe";
import { Prisma, NftMint } from "@prisma/client";
import { IContext } from "@/types/server";
import logger from "@/infrastructure/logging";
import { MeshClient } from "@/infrastructure/libs/mesh";
import { INftMintRepository } from "./data/interface";
import { NftMintBase, nftMintSelectBase } from "./data/type";
import NftMintConverter from "./data/converter";
import {
  InvalidReceiverAddressError,
  NetworkMismatchError,
  InvalidProductKeyError,
  AssetNameTooLongError,
} from "@/errors/graphql";

@injectable()
export class NftMintIssuanceService {
  constructor(
    @inject("NftMintRepository") private readonly repo: INftMintRepository,
    @inject("MeshClient") private readonly client: MeshClient,
    @inject("NftMintConverter") private readonly converter: NftMintConverter,
  ) {}

  async requestNftMint(
    userId: string,
    productKey: string,
    receiverAddress: string,
    ctx: IContext,
    policyId?: string,
  ): Promise<{ success: boolean; requestId: string; txHash?: string }> {
    const finalPolicyId = policyId || process.env.POLICY_ID || "policy_dev";
    
    let mintRequest: NftMint | null = null;

    try {
      const queueStart = Date.now();
      mintRequest = await ctx.issuer.internal(async (tx: Prisma.TransactionClient) => {
        return this.queueMint(ctx, tx, {
          policyId: finalPolicyId,
          productKey,
          receiver: receiverAddress,
        });
      });
      logger.info(`NFT mint queue phase completed in ${Date.now() - queueStart}ms`);

      const mintStart = Date.now();
      const txHash = await this.mintNow(ctx, mintRequest.id);
      logger.info(`NFT external mint completed in ${Date.now() - mintStart}ms`);
      
      const markStart = Date.now();
      await ctx.issuer.internal(async (tx: Prisma.TransactionClient) => {
        return this.markMinted(ctx, tx, mintRequest!.id, txHash);
      });
      logger.info(`NFT mark minted phase completed in ${Date.now() - markStart}ms`);

      return { success: true, requestId: mintRequest.id, txHash };
    } catch (error) {
      return this.markMintFailed(ctx, mintRequest?.id || "unknown", error);
    }
  }

  private async queueMint(
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

  private async mintNow(
    ctx: IContext,
    mintId: string,
  ): Promise<string> {
    const mint = await ctx.issuer.internal(async (tx) => {
      return tx.nftMint.findUnique({ where: { id: mintId }, ...nftMintSelectBase });
    });
    
    if (!mint) throw new Error("Mint not found");

    const { txHash } = await this.client.mintOne({
      policyId: mint.policyId,
      assetName: mint.assetName,
      receiver: mint.receiver,
    });
    return txHash;
  }

  private markMinted(ctx: IContext, tx: Prisma.TransactionClient, id: string, txHash: string) {
    return this.repo.update(ctx, id, this.converter.buildMarkMinted({ txHash }), tx);
  }

  private markFailed(ctx: IContext, tx: Prisma.TransactionClient, id: string, error: string) {
    return this.repo.update(ctx, id, this.converter.buildMarkFailed({ error }), tx);
  }

  private async markMintFailed(
    ctx: IContext,
    requestId: string,
    error: unknown,
  ): Promise<{ success: false; requestId: string }> {
    if (requestId !== "unknown") {
      const failStart = Date.now();
      await ctx.issuer.internal(async (tx: Prisma.TransactionClient) => {
        return this.markFailed(ctx, tx, requestId, error instanceof Error ? error.message : String(error));
      });
      logger.info(`NFT mark failed phase completed in ${Date.now() - failStart}ms`);
    }

    logger.error("NftMintIssuanceService.requestNftMint: failed", error);
    return { success: false, requestId };
  }
}
