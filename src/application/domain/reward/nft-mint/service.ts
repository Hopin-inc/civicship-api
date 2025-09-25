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
      receiver: "system-wallet",
    });

    return this.repo.create(ctx, createData, tx);
  }

  async processStateTransition(
    ctx: IContext,
    transition: {
      nftMintId: string;
      newStatus: NftMintStatus;
      txHash?: string;
      error?: string;
    },
    tx: Prisma.TransactionClient,
  ): Promise<PrismaNftMint> {
    const { nftMintId, newStatus, txHash, error } = transition;

    const currentMint = await this.repo.find(ctx, nftMintId);
    if (!currentMint) {
      throw new Error(`NftMint not found: ${nftMintId}`);
    }

    if (!this.canTransitionTo(currentMint.status, newStatus)) {
      logger.warn("Invalid state transition attempted", {
        nftMintId,
        currentStatus: currentMint.status,
        newStatus,
      });
      return currentMint;
    }

    if (
      !this.shouldUpdateMint(currentMint.status, newStatus, currentMint.txHash ?? undefined, txHash)
    ) {
      return currentMint;
    }

    const updateData = this.converter.buildStatusUpdate(newStatus, txHash, error);
    return this.repo.update(ctx, nftMintId, updateData, tx);
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
