import { inject, injectable } from "tsyringe";
import { Prisma, NftMintStatus } from "@prisma/client";
import { IContext } from "@/types/server";
import { INftMintRepository } from "./data/interface";
import NftMintConverter from "./data/converter";
import { PrismaNftMint } from "./data/type";
import logger from "@/infrastructure/logging";

@injectable()
export default class NftMintService {
  constructor(
    @inject("NftMintRepository") private readonly repo: INftMintRepository,
    @inject("NftMintConverter") private readonly converter: NftMintConverter,
  ) {}

  async countMintedByProduct(
    ctx: IContext,
    productId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<number> {
    const where = this.converter.mintedByProduct(productId);
    return this.repo.count(ctx, where, tx);
  }

  async createForOrderItem(
    ctx: IContext,
    orderItemId: string,
    nftWalletId: string,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaNftMint> {
    const createData = this.converter.buildMintCreate({
      orderItemId,
      nftWalletId,
      sequenceNum: 0,
    });

    return this.repo.create(ctx, createData, tx);
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
}
