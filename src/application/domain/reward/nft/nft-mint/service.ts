import { inject, injectable } from "tsyringe";
import { Prisma, NftMintStatus } from "@prisma/client";
import { IContext } from "@/types/server";
import { MeshClient } from "@/infrastructure/libs/mesh";
import { INftMintRepository } from "./data/interface";
import NftMintConverter from "./data/converter";
import { PrismaNftMint } from "@/application/domain/reward/nft/nft-mint/data/type";
import { PrismaOrderItem } from "@/application/domain/order/orderItem/type";
import NftMintLogger from "@/application/domain/reward/nft/nft-mint/logger";
import logger from "@/infrastructure/logging";
import pLimit from "p-limit";

@injectable()
export default class NftMintService {
  private readonly logger = new NftMintLogger();

  constructor(
    @inject("NftMintRepository") private readonly repo: INftMintRepository,
    @inject("MeshClient") private readonly client: MeshClient,
    @inject("NftMintConverter") private readonly converter: NftMintConverter,
  ) {}

  async requestNftMint(
    ctx: IContext,
    orderItem: PrismaOrderItem,
    receiverAddress: string,
    nftWalletId: string,
  ): Promise<{
    success: boolean;
    orderItemId: string;
    results: Array<{ mintId: string; status: NftMintStatus; txHash?: string; error?: string }>;
  }> {
    const { id: orderItemId, quantity } = orderItem;
    const startTime = Date.now();

    this.logger.startMint(orderItemId, nftWalletId, quantity);

    try {
      const mints = await this.phaseQueue(ctx, orderItemId, quantity, receiverAddress, nftWalletId);

      const limit = pLimit(5);
      const results = await Promise.all(
        mints.map((mint) =>
          limit(async () => {
            try {
              const txHash = await this.phaseMint(ctx, mint);
              await this.phaseMarkSubmitted(ctx, mint.id, txHash);
              return { mintId: mint.id, status: NftMintStatus.SUBMITTED, txHash };
            } catch (e) {
              const msg = e instanceof Error ? e.message : String(e);
              await this.markMintFailed(ctx, mint.id, e);
              return { mintId: mint.id, status: NftMintStatus.FAILED, error: msg };
            }
          }),
        ),
      );

      this.logger.success(orderItemId, results, Date.now() - startTime);
      return { success: true, orderItemId, results };
    } catch (error) {
      this.logger.failure(orderItemId, error);
      throw error;
    }
  }

  // ---------- フェーズ ----------

  private async phaseQueue(
    ctx: IContext,
    orderItemId: string,
    quantity: number,
    receiver: string,
    nftWalletId: string,
  ): Promise<PrismaNftMint[]> {
    const start = Date.now();
    const mints = await ctx.issuer.internal(async (tx: Prisma.TransactionClient) => {
      const existing = await this.repo.findManyByOrderItemId(ctx, orderItemId, tx);
      const shortage = Math.max(0, quantity - existing.length);
      if (shortage === 0) return existing;

      // let nextSeq = await this.repo.getNextSequenceNumber(ctx, orderItemId, tx);
      let nextSeq = 0;
      const created: PrismaNftMint[] = [];

      for (let i = 0; i < shortage; i++) {
        const sequenceNum = nextSeq++;
        const input = this.converter.buildMintCreate({
          orderItemId,
          sequenceNum,
          receiver,
          nftWalletId,
        });
        const row = await this.repo.create(ctx, input, tx);
        created.push(row);
      }
      return existing.concat(created);
    });
    this.logger.phase("queue", Date.now() - start, { count: mints.length });
    return mints;
  }

  private async phaseMint(ctx: IContext, mint: PrismaNftMint): Promise<string> {
    const start = Date.now();
    const { txHash } = await this.client.mintOne({
      receiverAddress: "test",
      assetName: "test",
    });
    this.logger.phase("external_mint", Date.now() - start, {
      mintId: mint.id,
      orderItemId: mint.orderItem?.id,
      txHash,
    });
    return txHash;
  }

  private async phaseMarkSubmitted(ctx: IContext, mintId: string, txHash: string) {
    const start = Date.now();
    await ctx.issuer.internal(async (tx: Prisma.TransactionClient) => {
      return this.repo.update(ctx, mintId, this.converter.buildMarkSubmitted({ txHash }), tx);
    });
    this.logger.phase("mark_submitted", Date.now() - start, { mintId });
  }

  private async markMintFailed(
    ctx: IContext,
    mintId: string,
    error: unknown,
  ): Promise<PrismaNftMint> {
    const failStart = Date.now();
    const result = await ctx.issuer.internal(async (tx: Prisma.TransactionClient) => {
      return this.repo.update(
        ctx,
        mintId,
        this.converter.buildMarkFailed({
          error: error instanceof Error ? error.message : String(error),
        }),
        tx,
      );
    });
    this.logger.phase("mark_failed", Date.now() - failStart, { mintId });
    return result;
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
      receiver: 'system-wallet',
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
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaNftMint> {
    const { nftMintId, newStatus, txHash, error } = transition;

    const currentMint = await this.repo.find(ctx, nftMintId);
    if (!currentMint) {
      throw new Error(`NftMint not found: ${nftMintId}`);
    }

    if (!this.canTransitionTo(currentMint.status as NftMintStatus, newStatus)) {
      logger.warn("Invalid state transition attempted", {
        nftMintId,
        currentStatus: currentMint.status,
        newStatus,
      });
      return currentMint;
    }

    return this.repo.updateStatus(ctx, nftMintId, newStatus, txHash, error, tx);
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
}
