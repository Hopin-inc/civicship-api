import {
  Prisma,
  TransactionReason,
  IncentiveGrantType,
  IncentiveGrantStatus,
  IncentiveGrantFailureCode,
} from "@prisma/client";
import { IContext } from "@/types/server";
import {
  ITransactionRepository,
  ITransactionService,
} from "@/application/domain/transaction/data/interface";
import TransactionConverter from "@/application/domain/transaction/data/converter";
import {
  PrismaTransactionDetail,
  transactionSelectDetail,
  GrantSignupBonusResult,
} from "@/application/domain/transaction/data/type";
import { GqlQueryTransactionsArgs } from "@/types/graphql";
import { getCurrentUserId } from "@/application/domain/utils";
import { inject, injectable } from "tsyringe";
import { determineFailureCode } from "./util/failureCodeResolver";
import { NotFoundError, ValidationError } from "@/errors/graphql";
import logger from "@/infrastructure/logging";

/**
 * Source ID for signup bonus grants.
 * CRITICAL: Must be constant to prevent duplicate grants from typos.
 */
const SIGNUP_SOURCE_ID = "default";

@injectable()
export default class TransactionService implements ITransactionService {
  constructor(
    @inject("TransactionRepository") private readonly repository: ITransactionRepository,
    @inject("TransactionConverter") private readonly converter: TransactionConverter,
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
    const data = this.converter.issueCommunityPoint(toWalletId, transferPoints, currentUserId, comment);
    const res = await this.repository.create(ctx, data, tx);
    return res;
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
    const data = this.converter.grantCommunityPoint(fromWalletId, transferPoints, memberWalletId, currentUserId, comment);
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
    const data = this.converter.donateSelfPoint(fromWalletId, toWalletId, transferPoints, currentUserId, comment);
    const transaction = await this.repository.create(ctx, data, tx);
    return transaction;
  }

  async reservationCreated(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    fromWalletId: string,
    toWalletId: string,
    transferPoints: number,
    reservationId: string,
    reason: TransactionReason
  ): Promise<PrismaTransactionDetail> {
    const currentUserId = getCurrentUserId(ctx);
    const data = this.converter.reservationCreated(fromWalletId, toWalletId, transferPoints, currentUserId, reservationId, reason);
    const transaction = await this.repository.create(ctx, data, tx);
    return transaction;
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
    const data = this.converter.purchaseTicket(fromWalletId, toWalletId, transferPoints, currentUserId);
    const res = await this.repository.create(ctx, data, tx);
    return res;
  }

  async refundTicket(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    fromWalletId: string,
    toWalletId: string,
    transferPoints: number,
  ): Promise<PrismaTransactionDetail> {
    const currentUserId = getCurrentUserId(ctx);
    const data = this.converter.refundTicket(fromWalletId, toWalletId, transferPoints, currentUserId);
    const res = await this.repository.create(ctx, data, tx);
    return res;
  }

  async refreshCurrentPoint(ctx: IContext, tx: Prisma.TransactionClient) {
    return this.repository.refreshCurrentPoints(ctx, tx);
  }

  /**
   * Grant signup bonus with complete transaction separation for safety.
   *
   * CRITICAL DESIGN:
   * - Uses 3 separate transactions to avoid PostgreSQL abort state issues
   * - Returns Result type (never throws) to preserve FAILED state
   * - Grant-first pattern ensures idempotency
   *
   * @returns Result object (COMPLETED | SKIPPED_ALREADY_COMPLETED | SKIPPED_PENDING | FAILED)
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
  ): Promise<GrantSignupBonusResult> {
    const { userId, communityId, toWalletId, bonusPoint, message } = args;

    // STEP1: Acquire grant (separate tx, create-first pattern)
    const grantOrResult = await this.acquireIncentiveGrant(
      ctx,
      userId,
      communityId,
      IncentiveGrantType.SIGNUP,
      SIGNUP_SOURCE_ID,
    );

    // Already exists (COMPLETED, PENDING, or FAILED)
    if (typeof grantOrResult !== "string") {
      return grantOrResult;
    }

    const grantId = grantOrResult;

    // STEP2: Execute grant (separate tx)
    return this.executeSignupBonusGrant(ctx, {
      grantId,
      toWalletId,
      bonusPoint,
      message,
    });
  }

  /**
   * Acquire incentive grant (separate tx).
   * Returns grantId if newly created, or Result if already exists.
   *
   * CRITICAL: Uses create-first pattern for concurrent safety.
   */
  private async acquireIncentiveGrant(
    ctx: IContext,
    userId: string,
    communityId: string,
    type: IncentiveGrantType,
    sourceId: string,
  ): Promise<string | GrantSignupBonusResult> {
    return ctx.issuer.public(ctx, async (tx) => {
      try {
        // Create first (optimistic lock acquisition)
        const grant = await tx.incentiveGrant.create({
          data: {
            userId,
            communityId,
            type,
            sourceId,
            status: IncentiveGrantStatus.PENDING,
          },
        });

        return grant.id;
      } catch (error) {
        // P2002: Unique constraint violation (grant already exists)
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
          // Read existing grant
          const existing = await tx.incentiveGrant.findUnique({
            where: {
              unique_incentive_grant: {
                userId,
                communityId,
                type,
                sourceId,
              },
            },
            include: {
              transaction: {
                select: transactionSelectDetail,
              },
            },
          });

          // 🚨 P2002 なのに findUnique が null = 整合性破壊（即エラー）
          if (!existing) {
            logger.error("Grant not found after P2002 (integrity violation)", {
              userId,
              communityId,
              type,
              sourceId,
            });
            throw new Error("Grant not found after P2002 (should never happen)");
          }

          // Return based on status
          if (existing.status === IncentiveGrantStatus.COMPLETED) {
            // 🚨 CRITICAL: Check for data corruption
            if (existing.transactionId && existing.transaction) {
              // Normal case: COMPLETED with valid transaction
              return {
                status: "SKIPPED_ALREADY_COMPLETED" as const,
                transaction: existing.transaction,
              };
            } else {
              // 🚨 DATA CORRUPTION: COMPLETED but transaction is null
              logger.error("DATA CORRUPTION: Grant is COMPLETED but transaction is null", {
                grantId: existing.id,
                userId,
                communityId,
                type,
                sourceId,
                transactionId: existing.transactionId,
                hasTransaction: !!existing.transaction,
              });

              // Treat as FAILED(UNKNOWN) to allow admin retry
              return {
                status: "FAILED" as const,
                grantId: existing.id,
                failureCode: IncentiveGrantFailureCode.UNKNOWN,
                lastError: "DATA CORRUPTION: Grant marked COMPLETED but transaction is null",
              };
            }
          } else if (existing.status === IncentiveGrantStatus.PENDING) {
            return {
              status: "SKIPPED_PENDING" as const,
              grantId: existing.id,
            };
          } else if (existing.status === IncentiveGrantStatus.FAILED) {
            // FAILED: Return as-is (retry must be explicit)
            return {
              status: "FAILED" as const,
              grantId: existing.id,
              failureCode: existing.failureCode ?? IncentiveGrantFailureCode.UNKNOWN,
              lastError: existing.lastError ?? undefined,
            };
          }
        }

        // Other errors: re-throw
        throw error;
      }
    });
  }

  /**
   * Execute signup bonus grant (STEP2 only, assumes grant already exists).
   * Used internally by grantSignupBonus and retry flow.
   *
   * CRITICAL: Checks for existing transaction at the start to prevent double issuance.
   */
  private async executeSignupBonusGrant(
    ctx: IContext,
    args: {
      grantId: string;
      toWalletId: string;
      bonusPoint: number;
      message?: string;
    },
  ): Promise<Extract<GrantSignupBonusResult, { status: "COMPLETED" | "FAILED" }>> {
    const { grantId, toWalletId, bonusPoint, message } = args;

    // 🚨 CRITICAL: Check if transaction already exists (double issuance prevention)
    const grantCheck = await ctx.issuer.public(ctx, (tx) =>
      tx.incentiveGrant.findUnique({
        where: { id: grantId },
        select: {
          status: true,
          transactionId: true,
          transaction: {
            select: transactionSelectDetail,
          },
        },
      }),
    );

    if (!grantCheck) {
      throw new NotFoundError("IncentiveGrant", { grantId });
    }

    // If transaction already exists, return it (idempotent)
    if (grantCheck.transactionId && grantCheck.transaction) {
      logger.info("Transaction already exists for grant (idempotent return)", {
        grantId,
        transactionId: grantCheck.transactionId,
      });

      return { status: "COMPLETED", transaction: grantCheck.transaction };
    }

    // Execute transaction creation
    try {
      const transaction = await ctx.issuer.public(ctx, async (tx) => {
        const transactionData = this.converter.signupBonus(toWalletId, bonusPoint, message);

        const transaction = await tx.transaction.create({
          data: transactionData,
          select: transactionSelectDetail,
        });

        // Link to grant and mark COMPLETED
        await tx.incentiveGrant.update({
          where: { id: grantId },
          data: {
            status: IncentiveGrantStatus.COMPLETED,
            transactionId: transaction.id,
            failureCode: null,
            lastError: null,
          },
        });

        return transaction;
      });

      return { status: "COMPLETED", transaction };
    } catch (error) {
      // Mark as FAILED (separate tx)
      const failureCode = determineFailureCode(error);
      const lastError = error instanceof Error ? error.message : String(error);

      await this.markGrantAsFailed(ctx, grantId, failureCode, lastError);

      logger.error("Signup bonus grant execution failed", {
        grantId,
        failureCode,
        lastError,
      });

      return { status: "FAILED", grantId, failureCode, lastError };
    }
  }

  /**
   * Mark grant as FAILED (separate tx).
   */
  private async markGrantAsFailed(
    ctx: IContext,
    grantId: string,
    failureCode: IncentiveGrantFailureCode,
    lastError?: string,
  ): Promise<void> {
    try {
      await ctx.issuer.public(ctx, async (tx) => {
        await tx.incentiveGrant.update({
          where: { id: grantId },
          data: {
            status: IncentiveGrantStatus.FAILED,
            failureCode,
            lastError: lastError?.substring(0, 5000), // Limit length
            lastAttemptedAt: new Date(),
          },
        });
      });
    } catch (updateError) {
      logger.error("Failed to mark grant as FAILED", {
        grantId,
        originalFailureCode: failureCode,
        originalError: lastError,
        updateError,
      });
      // 握りつぶす（これ以上のエラーハンドリングは不可能）
    }
  }

  /**
   * Retry failed signup bonus grant (public method for UseCase).
   * Resets grant to PENDING and re-executes.
   *
   * @param grantId - The failed grant ID
   * @param toWalletId - Wallet ID (from UseCase derivation)
   * @param bonusPoint - Bonus points (from config)
   * @param message - Optional message (from config)
   * @returns Result (COMPLETED or FAILED)
   */
  async retrySignupBonusGrant(
    ctx: IContext,
    args: {
      grantId: string;
      toWalletId: string;
      bonusPoint: number;
      message?: string;
    },
  ): Promise<Extract<GrantSignupBonusResult, { status: "COMPLETED" | "FAILED" }>> {
    const { grantId, toWalletId, bonusPoint, message } = args;

    // STEP1: Reset grant to PENDING (separate tx)
    await this.resetGrantToPending(ctx, grantId);

    // STEP2: Execute grant (separate tx)
    return this.executeSignupBonusGrant(ctx, {
      grantId,
      toWalletId,
      bonusPoint,
      message,
    });
  }

  /**
   * Reset grant to PENDING for retry (separate tx, private).
   *
   * Allows:
   * - FAILED → PENDING (always)
   * - PENDING → PENDING (only if stale, i.e., lastAttemptedAt < threshold)
   */
  private async resetGrantToPending(ctx: IContext, grantId: string): Promise<void> {
    const STALE_PENDING_THRESHOLD_MINUTES = 5; // 5分以上古いPENDINGは手動リトライ可能

    await ctx.issuer.public(ctx, async (tx) => {
      const grant = await tx.incentiveGrant.findUnique({
        where: { id: grantId },
      });

      if (!grant) {
        throw new NotFoundError("IncentiveGrant", { grantId });
      }

      // FAILED → PENDING: always allowed
      if (grant.status === IncentiveGrantStatus.FAILED) {
        await tx.incentiveGrant.update({
          where: { id: grantId },
          data: {
            status: IncentiveGrantStatus.PENDING,
            attemptCount: { increment: 1 },
            lastAttemptedAt: new Date(),
          },
        });
        return;
      }

      // PENDING → PENDING: only if stale (manual retry for stuck grants)
      if (grant.status === IncentiveGrantStatus.PENDING) {
        const threshold = new Date(Date.now() - STALE_PENDING_THRESHOLD_MINUTES * 60 * 1000);

        if (grant.lastAttemptedAt < threshold) {
          logger.info("Resetting stale PENDING grant for manual retry", {
            grantId,
            lastAttemptedAt: grant.lastAttemptedAt,
            thresholdMinutes: STALE_PENDING_THRESHOLD_MINUTES,
          });

          await tx.incentiveGrant.update({
            where: { id: grantId },
            data: {
              attemptCount: { increment: 1 },
              lastAttemptedAt: new Date(),
            },
          });
          return;
        } else {
          throw new ValidationError(
            "PENDING grant is too recent for manual retry (wait for batch cleanup or concurrent execution to finish)",
            {
              grantId,
              lastAttemptedAt: grant.lastAttemptedAt,
              thresholdMinutes: STALE_PENDING_THRESHOLD_MINUTES,
            },
          );
        }
      }

      // COMPLETED → error
      throw new ValidationError("COMPLETED grants cannot be retried", {
        grantId,
        currentStatus: grant.status,
      });
    });
  }
}
