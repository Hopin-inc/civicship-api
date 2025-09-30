import { inject, injectable } from "tsyringe";
import { Prisma, NftMintStatus } from "@prisma/client";
import { IContext } from "@/types/server";
import { INftMintRepository } from "./data/interface";
import NftMintConverter from "./data/converter";
import { PrismaNftMint } from "./data/type";
import logger from "@/infrastructure/logging";
import { NmkrClient } from "@/infrastructure/libs/nmkr/api/client";
import {
  NmkrMintingError,
  NmkrTokenUnavailableError,
  NmkrInsufficientCreditsError,
} from "@/errors/graphql";
import { MintAndSendSpecificResponse } from "@/infrastructure/libs/nmkr/type";
import { StripeMetadata } from "@/infrastructure/libs/stripe/type";

@injectable()
export default class NftMintService {
  constructor(
    @inject("NftMintRepository") private readonly repo: INftMintRepository,
    @inject("NftMintConverter") private readonly converter: NftMintConverter,
    @inject("NmkrClient") private readonly nmkrClient: NmkrClient,
  ) {}

  async countMintedByProduct(
    ctx: IContext,
    productId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<number> {
    const where = this.converter.mintedByProduct(productId);
    return this.repo.count(ctx, where, tx);
  }

  async createMintRecord(
    ctx: IContext,
    orderItemId: string,
    nftWalletId: string,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaNftMint> {
    const input = this.converter.buildMintCreate({
      orderItemId,
      nftWalletId,
    });
    const mint = await this.repo.create(ctx, input, tx);

    logger.debug("[OrderWebhook] Mint record created", {
      orderItemId,
      mintId: mint.id,
    });
    return mint;
  }

  async processStateTransition(
    ctx: IContext,
    transition: { nftMintId: string; status: NftMintStatus; txHash?: string; error?: string },
    tx: Prisma.TransactionClient,
  ): Promise<PrismaNftMint> {
    const currentMint = await this.repo.find(ctx, transition.nftMintId, tx);
    if (!currentMint) {
      throw new Error(`NftMint not found: ${transition.nftMintId}`);
    }

    if (!this.canTransitionTo(currentMint.status, transition.status)) {
      logger.warn("Invalid status transition attempted", {
        nftMintId: transition.nftMintId,
        currentStatus: currentMint.status,
        newStatus: transition.status,
      });
      return currentMint;
    }

    if (
      !this.shouldUpdateMint(
        currentMint.status,
        transition.status,
        currentMint.txHash ?? undefined,
        transition.txHash,
      )
    ) {
      logger.info("Skipping transition due to stale txHash", {
        nftMintId: transition.nftMintId,
        currentStatus: currentMint.status,
        newStatus: transition.status,
        currentTxHash: currentMint.txHash,
        newTxHash: transition.txHash,
      });
      return currentMint;
    }

    const input = this.converter.buildStatusUpdate(
      transition.status,
      transition.txHash,
      transition.error,
    );
    return this.repo.update(ctx, transition.nftMintId, input, tx);
  }

  private canTransitionTo(currentStatus: NftMintStatus, newStatus: NftMintStatus): boolean {
    const statusRank: Record<NftMintStatus, number> = {
      QUEUED: 0,
      SUBMITTED: 1,
      MINTED: 2,
      FAILED: 2,
    };
    return statusRank[newStatus] > statusRank[currentStatus];
  }

  private shouldUpdateMint(
    currentStatus: NftMintStatus,
    newStatus: NftMintStatus,
    currentTxHash?: string,
    newTxHash?: string,
  ): boolean {
    const canTransition = this.canTransitionTo(currentStatus, newStatus);
    if (!canTransition) return false;
    return !(currentTxHash && !newTxHash);
  }

  async mintViaNmkr(
    ctx: IContext,
    params: {
      mintId: string;
      projectUid: string;
      nftUid: string;
      walletAddress: string;
      orderId: string;
      orderItemId: string;
    },
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    try {
      const res = await this.nmkrClient.mintAndSendSpecific(
        params.projectUid,
        params.nftUid,
        1,
        params.walletAddress,
      );

      logger.debug("[NftMintService] NMKR mint triggered", res);

      if (!this.validateMintResponse(res)) {
        const validationError = this.createValidationError(res, params);
        logger.error("[NftMintService] NMKR mint validation failed", { 
          ...params, 
          response: res,
          error: validationError.message 
        });
        throw validationError;
      }

      await this.processStateTransition(
        ctx,
        { nftMintId: params.mintId, status: NftMintStatus.SUBMITTED },
        tx,
      );

      logger.info("[NftMintService] NMKR mint triggered & marked SUBMITTED", params);
    } catch (e) {
      const classifiedError = this.classifyNmkrError(e, params);
      logger.error("[NftMintService] NMKR mint failed", { ...params, error: classifiedError, e });
      throw classifiedError;
    }
  }

  private validateMintResponse(resp: MintAndSendSpecificResponse) {
    if (resp.mintAndSendId <= 0) return false;
    if (!resp.sendedNft?.length) return false;
    return !resp.sendedNft.some((nft) => !nft.minted);
  }

  private createValidationError(
    response: MintAndSendSpecificResponse, 
    params: { orderId: string; orderItemId: string }
  ): NmkrMintingError {
    const reasons: string[] = [];
    
    if (response.mintAndSendId <= 0) {
      reasons.push(`Invalid mintAndSendId: ${response.mintAndSendId}`);
    }
    if (!response.sendedNft?.length) {
      reasons.push("No NFTs in sendedNft array");
    }
    if (response.sendedNft?.some(nft => !nft.minted)) {
      reasons.push("Some NFTs failed to mint");
    }
    
    return new NmkrMintingError(
      `NMKR mint validation failed: ${reasons.join(", ")}`,
      params.orderId,
      params.orderItemId
    );
  }

  private classifyNmkrError(error: unknown, params: StripeMetadata): NmkrMintingError {
    if (error instanceof Error && error.message.includes("404")) {
      return new NmkrTokenUnavailableError(params.nmkrNftUid, params.orderId, params.orderItemId);
    } else if (error instanceof Error && error.message.includes("402")) {
      return new NmkrInsufficientCreditsError(params.orderId, params.orderItemId);
    }
    return new NmkrMintingError(
      "NMKR minting operation failed",
      params.orderId,
      params.orderItemId,
    );
  }
}
