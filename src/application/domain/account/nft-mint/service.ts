import 'reflect-metadata';
import { injectable, inject } from 'tsyringe';
import { IContext } from '@/types/server';
import { Prisma, NftMintStatus } from '@prisma/client';
import { INftMintRepository } from './data/interface';
import NftMintConverter from './data/converter';
import logger from '@/infrastructure/logging';

export interface NftMintStateTransition {
  nftMintId: string;
  newStatus: NftMintStatus;
  txHash?: string;
  error?: string;
}

@injectable()
export default class NftMintService {
  constructor(
    @inject("NftMintRepository") private readonly nftMintRepository: INftMintRepository,
  ) {}

  async createForOrderItem(
    ctx: IContext,
    orderItemId: string,
    nftWalletId: string,
    tx: Prisma.TransactionClient
  ) {
    const createData = NftMintConverter.toPrismaCreateInput({
      orderItemId,
      nftWalletId,
      status: NftMintStatus.QUEUED,
    });

    return this.nftMintRepository.create(ctx, createData, tx);
  }

  async processStateTransition(
    ctx: IContext,
    transition: NftMintStateTransition,
    tx?: Prisma.TransactionClient
  ) {
    const { nftMintId, newStatus, txHash, error } = transition;

    logger.info("Processing NFT mint state transition", {
      nftMintId,
      newStatus,
      txHash,
      error,
    });

    const currentMint = await this.nftMintRepository.find(ctx, nftMintId);
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

    return this.nftMintRepository.updateStatus(
      ctx,
      nftMintId,
      newStatus,
      txHash,
      error,
      tx
    );
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

  mapNmkrStateToStatus(nmkrState: string): NftMintStatus | null {
    switch (nmkrState) {
      case 'confirmed': return NftMintStatus.SUBMITTED;
      case 'finished': return NftMintStatus.MINTED;
      case 'canceled':
      case 'expired': return NftMintStatus.FAILED;
      default: return null;
    }
  }
}
