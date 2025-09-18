import { inject, injectable } from "tsyringe";
import { Prisma, NftMintStatus } from "@prisma/client";
import { IContext } from "@/types/server";
import logger from "@/infrastructure/logging";
import { MeshClient } from "@/infrastructure/libs/mesh";
import { INftMintRepository } from "./data/interface";
import { NftMintBase } from "./data/type";
import NftMintConverter from "./data/converter";
import NftMintValidator from "@/application/domain/account/nft-mint/validator";

@injectable()
export default class NftMintService {
  constructor(
    @inject("NftMintRepository") private readonly repo: INftMintRepository,
    @inject("MeshClient") private readonly client: MeshClient,
    @inject("NftMintConverter") private readonly converter: NftMintConverter,
    @inject("NftMintValidator") private readonly validator: NftMintValidator,
  ) {}

  async requestNftMint(
    ctx: IContext,
    productId: string,
    receiverAddress: string,
    nftWalletId: string,
  ): Promise<{ success: boolean; requestId: string; txHash?: string; status: NftMintStatus }> {
    const startTime = Date.now();

    this.logMintStart(nftWalletId, productId);

    let mintRequest: NftMintBase | null = null;

    try {
      mintRequest = await this.phaseQueue(ctx, productId, receiverAddress, nftWalletId);

      const txHash = await this.phaseMint(ctx, mintRequest.id);
      await this.phaseMarkMinted(ctx, mintRequest.id, txHash);

      const totalDuration = Date.now() - startTime;
      this.logMintSuccess(mintRequest.id, txHash, totalDuration);

      return { success: true, requestId: mintRequest.id, txHash, status: NftMintStatus.MINTED };
    } catch (error) {
      if (!mintRequest) {
        // queueMint 前で失敗
        logger.error("NFT mint failed before queueMint", {
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
      // queueMint 後 → markFailed
      return this.markMintFailed(ctx, mintRequest.id, error);
    }
  }

  private async phaseQueue(
    ctx: IContext,
    productId: string,
    receiver: string,
    nftWalletId: string,
  ): Promise<NftMintBase> {
    const start = Date.now();
    const result = await ctx.issuer.internal(async (tx: Prisma.TransactionClient) => {
      return this.queueMint(ctx, tx, { productId, receiver, nftWalletId });
    });
    this.logMintPhase("queue", Date.now() - start, { requestId: result.id });
    return result;
  }

  private async phaseMint(ctx: IContext, requestId: string): Promise<string> {
    const start = Date.now();
    const mint = await this.repo.find(ctx, requestId);
    if (!mint) throw new Error("Mint request not found");

    const { txHash } = await this.client.mintOne({
      policyId: mint.policyId,
      assetName: mint.assetName,
      receiver: mint.receiver,
    });
    this.logMintPhase("external_mint", Date.now() - start, { requestId, txHash });
    return txHash;
  }

  private async phaseMarkMinted(ctx: IContext, requestId: string, txHash: string) {
    const start = Date.now();
    await ctx.issuer.internal(async (tx: Prisma.TransactionClient) => {
      return this.markMinted(ctx, tx, requestId, txHash);
    });
    this.logMintPhase("mark_minted", Date.now() - start, { requestId });
  }

  private async queueMint(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    p: { productId: string; receiver: string; nftWalletId: string },
  ): Promise<NftMintBase> {
    this.validator.validateReceiverAddress(p.receiver);

    const sequenceNum = await this.repo.getNextSequenceNumber(ctx, p.productId, tx);
    const assetName = `${p.productId}-${String(sequenceNum).padStart(4, "0")}`;

    return this.repo.create(
      ctx,
      this.converter.buildMintCreate({
        policyId: p.productId,
        assetName,
        sequenceNum,
        receiver: p.receiver,
        nftWalletId: p.nftWalletId,
      }),
      tx,
    );
  }

  private markMinted(ctx: IContext, tx: Prisma.TransactionClient, id: string, txHash: string) {
    return this.repo.update(ctx, id, this.converter.buildMarkMinted({ txHash }), tx);
  }

  private logMintStart(nftWalletId: string, productKey: string): void {
    logger.info("NFT mint request started", {
      nftWalletId,
      productKey,
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
