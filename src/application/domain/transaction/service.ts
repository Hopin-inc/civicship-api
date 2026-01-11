import { Prisma, TransactionReason } from "@prisma/client";
import { IContext } from "@/types/server";
import {
  ITransactionRepository,
  ITransactionService,
} from "@/application/domain/transaction/data/interface";
import TransactionConverter from "@/application/domain/transaction/data/converter";
import {
  GrantSignupBonusResult,
  PrismaTransactionDetail,
} from "@/application/domain/transaction/data/type";
import { GqlQueryTransactionsArgs } from "@/types/graphql";
import { getCurrentUserId } from "@/application/domain/utils";
import { inject, injectable } from "tsyringe";
import { IIncentiveGrantService } from "./incentiveGrant/interface";
import logger from "@/infrastructure/logging";
import WalletService from "@/application/domain/account/wallet/service";

/**
 * Source ID for signup bonus grants.
 * CRITICAL: Must be constant to prevent duplicate grants from typos.
 */

@injectable()
export default class TransactionService implements ITransactionService {
  constructor(
    @inject("TransactionRepository") private readonly repository: ITransactionRepository,
    @inject("TransactionConverter") private readonly converter: TransactionConverter,
    @inject("IncentiveGrantService") private readonly incentiveGrantService: IIncentiveGrantService,
    @inject("WalletService") private readonly walletService: WalletService,
  ) {}

  async fetchTransactions(
    ctx: IContext,
    { cursor, filter, sort }: GqlQueryTransactionsArgs,
    take: number,
  ): Promise<PrismaTransactionDetail[]> {
    const where = this.converter.filter(filter ?? {});
    const orderBy = this.converter.sort(sort ?? {});

    return this.repository.query(ctx, where, orderBy, take, cursor);
  }

  async findTransaction(ctx: IContext, id: string): Promise<PrismaTransactionDetail | null> {
    return this.repository.find(ctx, id);
  }

  async issueCommunityPoint(
    ctx: IContext,
    transferPoints: number,
    toWalletId: string,
    tx: Prisma.TransactionClient,
    comment?: string,
  ): Promise<PrismaTransactionDetail> {
    const currentUserId = getCurrentUserId(ctx);
    const data = this.converter.issueCommunityPoint(
      toWalletId,
      transferPoints,
      currentUserId,
      comment,
    );
    return await this.repository.create(ctx, data, tx);
  }

  async grantCommunityPoint(
    ctx: IContext,
    transferPoints: number,
    fromWalletId: string,
    memberWalletId: string,
    tx: Prisma.TransactionClient,
    comment?: string,
  ): Promise<PrismaTransactionDetail> {
    const currentUserId = getCurrentUserId(ctx);
    const data = this.converter.grantCommunityPoint(
      fromWalletId,
      transferPoints,
      memberWalletId,
      currentUserId,
      comment,
    );
    const res = await this.repository.create(ctx, data, tx);
    return res;
  }

  async donateSelfPoint(
    ctx: IContext,
    fromWalletId: string,
    toWalletId: string,
    transferPoints: number,
    tx: Prisma.TransactionClient,
    comment?: string,
  ): Promise<PrismaTransactionDetail> {
    const currentUserId = getCurrentUserId(ctx);
    const data = this.converter.donateSelfPoint(
      fromWalletId,
      toWalletId,
      transferPoints,
      currentUserId,
      comment,
    );
    return await this.repository.create(ctx, data, tx);
  }

  async reservationCreated(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    fromWalletId: string,
    toWalletId: string,
    transferPoints: number,
    reservationId: string,
    reason: TransactionReason,
  ): Promise<PrismaTransactionDetail> {
    const currentUserId = getCurrentUserId(ctx);
    const data = this.converter.reservationCreated(
      fromWalletId,
      toWalletId,
      transferPoints,
      currentUserId,
      reservationId,
      reason,
    );
    return await this.repository.create(ctx, data, tx);
  }

  async giveRewardPoint(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    participationId: string,
    transferPoints: number,
    fromWalletId: string,
    toWalletId: string,
  ): Promise<PrismaTransactionDetail> {
    const currentUserId = getCurrentUserId(ctx);
    const data = this.converter.giveRewardPoint(
      fromWalletId,
      toWalletId,
      participationId,
      transferPoints,
      currentUserId,
    );
    const res = await this.repository.create(ctx, data, tx);
    return res;
  }

  async purchaseTicket(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    fromWalletId: string,
    toWalletId: string,
    transferPoints: number,
  ): Promise<PrismaTransactionDetail> {
    const currentUserId = getCurrentUserId(ctx);
    const data = this.converter.purchaseTicket(
      fromWalletId,
      toWalletId,
      transferPoints,
      currentUserId,
    );
    return await this.repository.create(ctx, data, tx);
  }

  async refundTicket(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    fromWalletId: string,
    toWalletId: string,
    transferPoints: number,
  ): Promise<PrismaTransactionDetail> {
    const currentUserId = getCurrentUserId(ctx);
    const data = this.converter.refundTicket(
      fromWalletId,
      toWalletId,
      transferPoints,
      currentUserId,
    );
    return await this.repository.create(ctx, data, tx);
  }

  async refreshCurrentPoint(ctx: IContext, tx: Prisma.TransactionClient) {
    return this.repository.refreshCurrentPoints(ctx, tx);
  }

  /**
   * Grant signup bonus with complete transaction separation for safety.
   * Executes the grant and logs the result.
   *
   * Delegates to IncentiveGrantService and handles result logging.
   */
  async grantSignupBonus(
    ctx: IContext,
    args: {
      userId: string;
      communityId: string;
      toWalletId: string;
      bonusPoint: number;
      message?: string;
    },
  ): Promise<void> {
    const { userId, communityId, bonusPoint } = args;

    // Get community wallet
    const communityWallet = await this.walletService.findCommunityWalletOrThrow(ctx, communityId);

    // ポイント付与実行
    const result = await this.incentiveGrantService.grantSignupBonus(ctx, {
      ...args,
      fromWalletId: communityWallet.id,
    });

    // 結果ログ
    this.logSignupBonusResult(result, userId, communityId, bonusPoint);
  }

  /**
   * Retry failed signup bonus grant (public method for UseCase).
   * Resets grant to PENDING and re-executes.
   *
   * Delegates to IncentiveGrantService.
   *
   * @returns Result (COMPLETED or FAILED)
   */
  async retrySignupBonusGrant(
    ctx: IContext,
    args: {
      grantId: string;
      communityId: string;
      toWalletId: string;
      bonusPoint: number;
      message?: string;
    },
  ): Promise<Extract<GrantSignupBonusResult, { status: "COMPLETED" | "FAILED" }>> {
    const { communityId } = args;

    // Get community wallet
    const communityWallet = await this.walletService.findCommunityWalletOrThrow(ctx, communityId);

    return this.incentiveGrantService.retrySignupBonusGrant(ctx, {
      ...args,
      fromWalletId: communityWallet.id,
    });
  }

  /**
   * Find stale PENDING grants for monitoring and cleanup.
   * Returns grants that have been in PENDING state for longer than the threshold.
   *
   * Delegates to IncentiveGrantService.
   *
   * @param ctx
   * @param thresholdMinutes - How old a PENDING grant must be to be considered stale (default: 30 minutes)
   */
  async findStalePendingGrants(
    ctx: IContext,
    thresholdMinutes: number = 30,
  ): Promise<
    Array<{
      id: string;
      userId: string;
      communityId: string;
      attemptCount: number;
      lastAttemptedAt: Date;
      createdAt: Date;
    }>
  > {
    return this.incentiveGrantService.findStalePendingGrants(ctx, thresholdMinutes);
  }

  /**
   * Get grant information for retry operations.
   * Delegates to IncentiveGrantService.
   *
   * @param grantId - Grant ID to retrieve
   * @returns Grant info with userId, communityId, status
   */
  async getGrantInfoForRetry(
    ctx: IContext,
    grantId: string,
  ): Promise<{
    userId: string;
    communityId: string;
    status: string;
  }> {
    return this.incentiveGrantService.getGrantInfoForRetry(ctx, grantId);
  }

  /**
   * Log signup bonus grant result for monitoring and debugging.
   */
  private logSignupBonusResult(
    result: GrantSignupBonusResult,
    userId: string,
    communityId: string,
    bonusPoint: number,
  ): void {
    switch (result.status) {
      case "COMPLETED":
        logger.info("Signup bonus granted successfully", {
          userId,
          communityId,
          bonusPoint,
          transactionId: result.transaction.id,
        });
        break;

      case "SKIPPED_ALREADY_COMPLETED":
        logger.info("Signup bonus already granted (skipped)", {
          userId,
          communityId,
          bonusPoint,
          transactionId: result.transaction.id,
        });
        break;

      case "SKIPPED_PENDING":
        logger.warn("Signup bonus grant already in progress (skipped)", {
          userId,
          communityId,
          bonusPoint,
          grantId: result.grantId,
        });
        break;

      case "FAILED":
        logger.error("Signup bonus grant failed", {
          userId,
          communityId,
          bonusPoint,
          grantId: result.grantId,
          failureCode: result.failureCode,
          lastError: result.lastError,
        });
        break;
    }
  }
}
