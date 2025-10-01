import { inject, injectable } from "tsyringe";
import { Prisma, NftMintStatus } from "@prisma/client";
import { IContext } from "@/types/server";
import { INftMintRepository } from "./data/interface";
import NftMintConverter from "./data/converter";
import { PrismaNftMint } from "./data/type";
import logger from "@/infrastructure/logging";
import { NmkrClient } from "@/infrastructure/libs/nmkr/api/client";
import {
  classifyNmkrError,
  createValidationError,
  validateMintResponse,
} from "@/infrastructure/libs/nmkr/validator";
import { MintAndSendSpecificResponse } from "@/infrastructure/libs/nmkr/type";

export class InvalidStateTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidStateTransitionError";
  }
}

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
    nftInstanceId: string,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaNftMint> {
    try {
      const input = this.converter.buildMintCreate({
        orderItemId,
        nftInstanceId,
      });
      const mint = await this.repo.create(ctx, input, tx);

      logger.info("[NftMintService] Mint record created in QUEUED status", {
        orderItemId,
        nftInstanceId,
        mintId: mint.id,
        status: NftMintStatus.QUEUED,
      });
      return mint;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("P2002") &&
        error.message.includes("order_item_id")
      ) {
        logger.warn("[NftMintService] Mint job already exists for order item", {
          orderItemId,
        });

        const existing = await this.repo.query(ctx, orderItemId, tx);
        if (existing.length > 0) {
          return existing[0];
        }
      }
      throw error;
    }
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
  ): Promise<MintAndSendSpecificResponse> {
    try {
      const res = await this.nmkrClient.mintAndSendSpecific(
        params.projectUid,
        params.nftUid,
        1,
        params.walletAddress,
      );

      logger.debug("[NftMintService] NMKR mint triggered", res);

      if (!validateMintResponse(res)) {
        const validationError = createValidationError(res, params);
        logger.error("[NftMintService] NMKR mint validation failed", {
          ...params,
          response: res,
          error: validationError.message,
        });
        throw validationError;
      }

      await this.processStateTransition(
        ctx,
        { nftMintId: params.mintId, status: NftMintStatus.SUBMITTED },
        tx,
      );

      logger.info("[NftMintService] NMKR mint triggered & marked SUBMITTED", params);

      return res;
    } catch (e) {
      const classifiedError = classifyNmkrError(e, params);
      logger.error("[NftMintService] NMKR mint failed", { ...params, error: classifiedError, e });
      throw classifiedError;
    }
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

    this.assertValidTransition(currentMint.status, transition.status);

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
    const updatedMint = await this.repo.update(ctx, transition.nftMintId, input, tx);

    logger.info("[NftMintService] Status transition completed", {
      nftMintId: transition.nftMintId,
      fromStatus: currentMint.status,
      toStatus: transition.status,
      txHash: transition.txHash,
      error: transition.error,
    });

    return updatedMint;
  }

  private canTransitionTo(currentStatus: NftMintStatus, newStatus: NftMintStatus): boolean {
    const validTransitions: Map<NftMintStatus, NftMintStatus[]> = new Map([
      [NftMintStatus.QUEUED, [NftMintStatus.SUBMITTED, NftMintStatus.FAILED]],
      [NftMintStatus.SUBMITTED, [NftMintStatus.MINTED, NftMintStatus.FAILED]],
      [NftMintStatus.MINTED, []],
      [NftMintStatus.FAILED, [NftMintStatus.QUEUED]],
    ]);

    const allowedTransitions = validTransitions.get(currentStatus) || [];
    return allowedTransitions.includes(newStatus);
  }

  private assertValidTransition(from: NftMintStatus, to: NftMintStatus): void {
    if (!this.canTransitionTo(from, to)) {
      throw new InvalidStateTransitionError(`Invalid state transition from ${from} to ${to}`);
    }
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
}
