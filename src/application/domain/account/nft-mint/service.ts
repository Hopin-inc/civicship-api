import { inject, injectable } from "tsyringe";
import { Prisma, NftMintStatus } from "@prisma/client";
import { IContext } from "@/types/server";
import logger from "@/infrastructure/logging";
import { MeshClient } from "@/infrastructure/libs/mesh";
import { INftMintRepository } from "./data/interface";
import { NftMintBase } from "./data/type";
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
    ctx: IContext,
    productKey: string,
    receiverAddress: string,
    nftWalletId: string,
    policyId?: string,
  ): Promise<{ success: boolean; requestId: string; txHash?: string }> {
    const finalPolicyId = policyId || process.env.POLICY_ID || "policy_dev";
    this.logMintStart(nftWalletId, productKey, finalPolicyId);

    const mintRequest = await ctx.issuer.internal(async (tx: Prisma.TransactionClient) => {
      return this.queueMint(ctx, tx, {
        policyId: finalPolicyId,
        productKey,
        receiver: receiverAddress,
        nftWalletId,
      });
    });

    try {
      const txHash = await this.mintNow(ctx, mintRequest.id);

      await ctx.issuer.internal(async (tx) => {
        return this.markMinted(ctx, tx, mintRequest.id, txHash);
      });

      this.logMintSuccess(mintRequest.id, txHash);
      return { success: true, requestId: mintRequest.id, txHash };
    } catch (error) {
      logger.warn("Mint failed, leaving as QUEUED for retry", {
        requestId: mintRequest.id,
        error: error instanceof Error ? error.message : String(error),
      });

      // 失敗してもFAILEDにはせず、QUEUEDのまま残す（バッチ処理で再試行予定）
      return { success: false, requestId: mintRequest.id };
    }
  }

  private async queueMint(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    p: { policyId: string; productKey: string; receiver: string; nftWalletId: string },
  ): Promise<NftMintBase> {
    this.validateProductKey(p.productKey);
    this.validateReceiverAddress(p.receiver);

    const sequenceNum = await this.repo.getNextSequenceNumber(ctx, p.policyId, tx);
    const assetName = `${p.productKey}-${String(sequenceNum).padStart(4, "0")}`;

    this.validateAssetNameLength(assetName);

    return this.repo.create(
      ctx,
      this.converter.buildMintCreate({
        policyId: p.policyId,
        assetName,
        sequenceNum,
        receiver: p.receiver,
        nftWalletId: p.nftWalletId,
      }),
      tx,
    );
  }

  private async mintNow(ctx: IContext, mintId: string): Promise<string> {
    const mint = await this.repo.find(ctx, mintId);
    if (!mint) throw new Error("Mint request not found");

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

  private validateProductKey(productKey: string): void {
    const pattern = /^[a-z0-9-]{1,24}$/;
    if (!pattern.test(productKey)) throw new InvalidProductKeyError(productKey);
  }

  private validateReceiverAddress(receiver: string): void {
    if (!receiver.startsWith("addr_test") && !receiver.startsWith("addr1")) {
      throw new InvalidReceiverAddressError(receiver);
    }
    const networkId = process.env.CARDANO_NETWORK_ID || "0";
    const expected = networkId === "1" ? "mainnet" : "testnet";
    if (expected === "testnet" && !receiver.startsWith("addr_test")) {
      throw new NetworkMismatchError(receiver, "testnet");
    }
    if (expected === "mainnet" && !receiver.startsWith("addr1")) {
      throw new NetworkMismatchError(receiver, "mainnet");
    }
  }

  private validateAssetNameLength(assetName: string): void {
    const bytes = Buffer.byteLength(assetName, "utf8");
    if (bytes > 32) throw new AssetNameTooLongError(assetName, bytes);
  }

  private logMintStart(nftWalletId: string, productKey: string, policyId: string): void {
    logger.info("NFT mint request started", { nftWalletId, productKey, policyId });
  }

  private logMintSuccess(requestId: string, txHash: string): void {
    logger.info("NFT mint completed successfully", {
      requestId,
      txHash,
      status: NftMintStatus.MINTED,
    });
  }
}
