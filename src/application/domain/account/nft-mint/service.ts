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
  ): Promise<{ success: boolean; requestId: string; txHash?: string; status: NftMintStatus }> {
    const finalPolicyId = policyId || process.env.POLICY_ID || "policy_dev";
    const startTime = Date.now();

    this.logMintStart(nftWalletId, productKey, finalPolicyId);

    let mintRequest: NftMintBase | null = null;

    try {
      // Phase 1: queue
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

      // Phase 2: external mint
      const mintStart = Date.now();
      const txHash = await this.mintNow(ctx, mintRequest.id);
      this.logMintPhase("external_mint", Date.now() - mintStart, {
        requestId: mintRequest.id,
        txHash,
      });

      // Phase 3: mark minted
      const markStart = Date.now();
      await ctx.issuer.internal(async (tx) => {
        return this.markMinted(ctx, tx, mintRequest!.id, txHash);
      });
      this.logMintPhase("mark_minted", Date.now() - markStart, { requestId: mintRequest!.id });

      const totalDuration = Date.now() - startTime;
      this.logMintSuccess(mintRequest.id, txHash, totalDuration);

      return { success: true, requestId: mintRequest.id, txHash, status: NftMintStatus.MINTED };
    } catch (error) {
      if (!mintRequest) {
        // queueMint 前で失敗 → DB にレコードがないので FAILED にはせず throw
        logger.error("NFT mint failed before queueMint", {
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }

      // queueMint 後なら markFailed
      return this.markMintFailed(ctx, mintRequest.id, error);
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
      });
      throw new InvalidProductKeyError(productKey);
    }
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
    if (bytes > 32) {
      throw new AssetNameTooLongError(assetName, bytes);
    }
  }

  private logMintStart(nftWalletId: string, productKey: string, policyId: string): void {
    logger.info("NFT mint request started", {
      nftWalletId,
      productKey,
      policyId,
      timestamp: new Date().toISOString(),
    });
  }

  private logMintPhase(
    phase: string,
    duration: number,
    details?: Partial<{ requestId: string; txHash?: string }>,
  ): void {
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
      status: NftMintStatus.MINTED,
      timestamp: new Date().toISOString(),
    });
  }

  private async markMintFailed(
    ctx: IContext,
    requestId: string,
    error: unknown,
  ): Promise<{ success: false; requestId: string; status: NftMintStatus }> {
    const failStart = Date.now();
    await ctx.issuer.internal(async (tx: Prisma.TransactionClient) => {
      return this.markFailed(
        ctx,
        tx,
        requestId,
        error instanceof Error ? error.message : String(error),
      );
    });
    this.logMintPhase("mark_failed", Date.now() - failStart, { requestId });

    logger.error("NftMintIssuanceService.requestNftMint: failed", {
      requestId,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });

    return { success: false, requestId, status: NftMintStatus.FAILED };
  }

  private markFailed(ctx: IContext, tx: Prisma.TransactionClient, id: string, error: string) {
    return this.repo.update(ctx, id, this.converter.buildMarkFailed({ error }), tx);
  }
}
