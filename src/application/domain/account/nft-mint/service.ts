import { inject, injectable } from "tsyringe";
import { Prisma } from "@prisma/client";
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
    const startTime = Date.now();
    
    this.logMintStart(nftWalletId, productKey, finalPolicyId);
    
    let mintRequest: NftMintBase | null = null;

    try {
      const queueStart = Date.now();
      mintRequest = await ctx.issuer.internal(async (tx: Prisma.TransactionClient) => {
        return this.queueMint(ctx, tx, {
          policyId: finalPolicyId,
          productKey,
          receiver: receiverAddress,
          nftWalletId,
        });
      });
      this.logMintPhase("queue", Date.now() - queueStart, { requestId: mintRequest.id });

      const mintStart = Date.now();
      const txHash = await this.mintNow(ctx, mintRequest.id);
      this.logMintPhase("external_mint", Date.now() - mintStart, { requestId: mintRequest.id, txHash });
      
      const markStart = Date.now();
      await ctx.issuer.internal(async (tx) => {
        return this.markMinted(ctx, tx, mintRequest!.id, txHash);
      });
      this.logMintPhase("mark_minted", Date.now() - markStart, { requestId: mintRequest!.id });

      const totalDuration = Date.now() - startTime;
      this.logMintSuccess(mintRequest.id, txHash, totalDuration);

      return { success: true, requestId: mintRequest.id, txHash };
    } catch (error) {
      const totalDuration = Date.now() - startTime;
      if (mintRequest) {
        this.logMintFailure(mintRequest.id, error, totalDuration);
      }
      return this.markMintFailed(ctx, mintRequest?.id || "unknown", error);
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
    if (!pattern.test(productKey)) {
      logger.warn("NFT mint validation failed: invalid product key", {
        productKey,
        pattern: pattern.source,
        validation: "product_key_format",
        timestamp: new Date().toISOString(),
      });
      throw new InvalidProductKeyError(productKey);
    }
  }

  private validateReceiverAddress(receiver: string): void {
    if (!receiver.startsWith("addr_test") && !receiver.startsWith("addr1")) {
      logger.warn("NFT mint validation failed: invalid receiver address format", {
        receiver,
        expectedPrefixes: ["addr_test", "addr1"],
        validation: "receiver_address_format",
        timestamp: new Date().toISOString(),
      });
      throw new InvalidReceiverAddressError(receiver);
    }
    
    const networkId = process.env.CARDANO_NETWORK_ID || "0";
    const expected = networkId === "1" ? "mainnet" : "testnet";
    
    if (expected === "testnet" && !receiver.startsWith("addr_test")) {
      logger.warn("NFT mint validation failed: network mismatch", {
        receiver,
        expectedNetwork: "testnet",
        actualPrefix: receiver.substring(0, 9),
        validation: "network_mismatch",
        timestamp: new Date().toISOString(),
      });
      throw new NetworkMismatchError(receiver, "testnet");
    }
    
    if (expected === "mainnet" && !receiver.startsWith("addr1")) {
      logger.warn("NFT mint validation failed: network mismatch", {
        receiver,
        expectedNetwork: "mainnet",
        actualPrefix: receiver.substring(0, 5),
        validation: "network_mismatch",
        timestamp: new Date().toISOString(),
      });
      throw new NetworkMismatchError(receiver, "mainnet");
    }
  }

  private validateAssetNameLength(assetName: string): void {
    const bytes = Buffer.byteLength(assetName, "utf8");
    if (bytes > 32) {
      logger.warn("NFT mint validation failed: asset name too long", {
        assetName,
        byteLength: bytes,
        maxLength: 32,
        validation: "asset_name_length",
        timestamp: new Date().toISOString(),
      });
      throw new AssetNameTooLongError(assetName, bytes);
    }
  }

  private logMintStart(nftWalletId: string, productKey: string, policyId: string): void {
    logger.info("NFT mint request started", {
      nftWalletId,
      productKey,
      policyId,
      timestamp: new Date().toISOString(),
      phase: "start",
    });
  }

  private logMintPhase(phase: string, duration: number, details?: Record<string, any>): void {
    logger.info(`NFT mint ${phase} completed`, {
      phase,
      duration,
      timestamp: new Date().toISOString(),
      ...details,
    });
  }

  private logMintSuccess(requestId: string, txHash: string, totalDuration: number): void {
    logger.info("NFT mint completed successfully", {
      requestId,
      txHash,
      totalDuration,
      status: "MINTED",
      timestamp: new Date().toISOString(),
    });
  }

  private logMintFailure(requestId: string, error: unknown, totalDuration: number): void {
    const errorDetails = {
      requestId,
      error: error instanceof Error ? error.message : String(error),
      totalDuration,
      status: "FAILED",
      timestamp: new Date().toISOString(),
    };

    if (error instanceof InvalidReceiverAddressError || 
        error instanceof InvalidProductKeyError ||
        error instanceof AssetNameTooLongError ||
        error instanceof NetworkMismatchError) {
      logger.warn("NFT mint failed due to validation error", errorDetails);
    } else {
      logger.error("NFT mint failed due to system error", errorDetails);
    }
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
      this.logMintPhase("mark_failed", Date.now() - failStart, { requestId });
    }

    logger.error("NftMintIssuanceService.requestNftMint: failed", {
      requestId,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
      service: "NftMintIssuanceService",
      method: "requestNftMint",
    });
    return { success: false, requestId };
  }

  private markFailed(ctx: IContext, tx: Prisma.TransactionClient, id: string, error: string) {
    return this.repo.update(ctx, id, this.converter.buildMarkFailed({ error }), tx);
  }
}
