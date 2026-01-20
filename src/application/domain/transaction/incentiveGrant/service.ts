import { IContext } from "@/types/server";
import { inject, injectable } from "tsyringe";
import { IncentiveGrantFailureCode, IncentiveGrantType, Prisma } from "@prisma/client";
import { IIncentiveGrantRepository } from "./data/interface";
import { PrismaIncentiveGrant } from "./data/type";
import IncentiveGrantConverter from "./data/converter";
import CommunitySignupBonusConfigService from "@/application/domain/account/community/config/incentive/signup/service";
import WalletService from "@/application/domain/account/wallet/service";
import { ITransactionService } from "@/application/domain/transaction/data/interface";
import logger from "@/infrastructure/logging";
import {
  InsufficientBalanceError,
  NotFoundError,
  InvalidGrantStatusError,
  UnsupportedGrantTypeError,
  IncentiveDisabledError,
} from "@/errors/graphql";

export type SignupBonusGrantResult = {
  granted: boolean;
  transaction: {
    id: string;
    toPointChange: number;
    comment: string | null;
  } | null;
};

export type RetryGrantResult = {
  success: boolean;
  transaction: {
    id: string;
    toPointChange: number;
    comment: string | null;
  } | null;
};

@injectable()
export default class IncentiveGrantService {
  constructor(
    @inject("IncentiveGrantRepository")
    private readonly repository: IIncentiveGrantRepository,
    @inject("IncentiveGrantConverter")
    private readonly converter: IncentiveGrantConverter,
    @inject("CommunitySignupBonusConfigService")
    private readonly signupBonusConfigService: CommunitySignupBonusConfigService,
    @inject("WalletService")
    private readonly walletService: WalletService,
    @inject("TransactionService")
    private readonly transactionService: ITransactionService,
  ) {}

  /**
   * Grant signup bonus if enabled (best-effort).
   * This method implements idempotent grant logic with TOCTOU-safe balance checking.
   *
   * Flow:
   * 1. Check if signup bonus is enabled
   * 2. Create PENDING grant record (idempotent via unique constraint)
   * 3. Check community wallet balance (TOCTOU-safe)
   * 4. Create transaction to transfer points
   * 5. Mark grant as COMPLETED
   * 6. Return transaction details for notification
   *
   * Error handling:
   * - P2002 (unique constraint): Already granted, skip silently
   * - InsufficientBalanceError: Mark as FAILED with INSUFFICIENT_FUNDS
   * - NotFoundError: Mark as FAILED with WALLET_NOT_FOUND
   * - Other errors: Mark as FAILED with UNKNOWN
   *
   * Note: This method does NOT throw errors. It logs warnings and marks
   * grants as failed, allowing membership creation to continue.
   *
   * @param ctx - Context
   * @param userId - User ID receiving the bonus
   * @param communityId - Community ID granting the bonus
   * @param sourceId - Composite key (${userId}_${communityId}) used as sourceId for idempotency
   * @param tx - Transaction client (required)
   * @returns SignupBonusGrantResult with transaction details if granted
   */
  async grantSignupBonusIfEnabled(
    ctx: IContext,
    userId: string,
    communityId: string,
    sourceId: string,
    tx: Prisma.TransactionClient,
  ): Promise<SignupBonusGrantResult> {
    const logContext = {
      logctx: "IncentiveGrantService.grantSignupBonusIfEnabled",
      userId,
      communityId,
      sourceId,
    };

    let grantRecordCreated = false;
    try {
      // 1. Check if signup bonus is enabled
      const config = await this.signupBonusConfigService.get(ctx, communityId, tx);
      if (!config?.isEnabled) {
        logger.debug("Signup bonus not enabled, skipping", logContext);
        return { granted: false, transaction: null };
      }

      logger.info("Attempting to grant signup bonus", {
        ...logContext,
        bonusPoint: config.bonusPoint,
      });

      // 2. Create PENDING grant record (idempotent via unique constraint)
      const createData = this.converter.createPending({
        userId,
        communityId,
        type: IncentiveGrantType.SIGNUP,
        sourceId: sourceId,
      });

      try {
        await this.repository.create(ctx, createData, tx);
        grantRecordCreated = true;
      } catch (error: any) {
        // P2002 = unique constraint violation = already granted
        if (error?.code === "P2002") {
          logger.info("Signup bonus already granted (idempotent)", logContext);
          return { granted: false, transaction: null };
        }
        throw error; // Re-throw other errors
      }

      // 3. TOCTOU-safe balance check
      await this.walletService.checkCommunityWalletBalanceInTransaction(
        ctx,
        communityId,
        config.bonusPoint,
        tx,
      );

      // 4. Get wallets
      const [communityWallet, memberWallet] = await Promise.all([
        this.walletService.findCommunityWalletOrThrow(ctx, communityId, tx),
        this.walletService.findMemberWalletOrThrow(ctx, userId, communityId, tx),
      ]);

      // 5. Create transaction
      const transaction = await this.transactionService.grantSignupBonus(
        ctx,
        config.bonusPoint,
        communityWallet.id,
        memberWallet.id,
        userId,
        tx,
        config.message,
      );

      // 6. Mark as COMPLETED
      await this.repository.markAsCompleted(
        ctx,
        userId,
        communityId,
        IncentiveGrantType.SIGNUP,
        sourceId,
        transaction.id,
        tx,
      );

      logger.info("Signup bonus granted successfully", {
        ...logContext,
        transactionId: transaction.id,
        bonusPoint: config.bonusPoint,
      });

      // 7. Return transaction details for notification
      return {
        granted: true,
        transaction: {
          id: transaction.id,
          toPointChange: transaction.toPointChange,
          comment: transaction.comment,
        },
      };
    } catch (error: any) {
      // Best-effort: Log error and mark as failed, but don't throw
      logger.warn("Signup bonus grant failed (best-effort)", {
        ...logContext,
        error: error.message,
        stack: error.stack,
      });

      // Only mark as failed if the PENDING record was created
      if (grantRecordCreated) {
        try {
          // Determine failure code
          let failureCode: IncentiveGrantFailureCode;
          if (error instanceof InsufficientBalanceError) {
            failureCode = IncentiveGrantFailureCode.INSUFFICIENT_FUNDS;
          } else if (error instanceof NotFoundError) {
            failureCode = IncentiveGrantFailureCode.WALLET_NOT_FOUND;
          } else if (error?.code?.startsWith("P")) {
            failureCode = IncentiveGrantFailureCode.DATABASE_ERROR;
          } else {
            failureCode = IncentiveGrantFailureCode.UNKNOWN;
          }

          // Mark as failed (only if PENDING record was created)
          await this.repository.markAsFailed(
            ctx,
            userId,
            communityId,
            IncentiveGrantType.SIGNUP,
            sourceId,
            failureCode,
            error.message,
            tx,
          );
        } catch (markFailedError: any) {
          // If marking as failed also fails, just log it
          logger.error("Failed to mark incentive grant as failed", {
            ...logContext,
            error: markFailedError.message,
          });
        }
      }

      // Return failure result
      return { granted: false, transaction: null };
    }
  }

  /**
   * Retry a failed incentive grant.
   * This method re-attempts to grant the incentive for a FAILED grant record.
   *
   * Flow:
   * 1. Find the grant record by ID
   * 2. Verify it's in FAILED status
   * 3. Get the signup bonus configuration
   * 4. Check community wallet balance (TOCTOU-safe)
   * 5. Create transaction to transfer points
   * 6. Mark grant as COMPLETED
   * 7. Return transaction details for notification
   *
   * Error handling:
   * - NotFoundError: Grant record not found
   * - Error: Grant is not in FAILED status
   * - InsufficientBalanceError: Mark as FAILED with INSUFFICIENT_FUNDS
   * - NotFoundError: Mark as FAILED with WALLET_NOT_FOUND
   * - Other errors: Mark as FAILED with UNKNOWN
   *
   * Note: This method DOES throw errors for validation failures (not found, wrong status).
   * Business logic errors (insufficient balance, etc.) mark the grant as FAILED and throw.
   *
   * @param ctx - Context
   * @param incentiveGrantId - IncentiveGrant ID to retry
   * @param tx - Transaction client (required)
   * @returns RetryGrantResult with transaction details if successful
   */
  async retryFailedGrant(
    ctx: IContext,
    incentiveGrantId: string,
    tx: Prisma.TransactionClient,
  ): Promise<RetryGrantResult> {
    const logContext = {
      logctx: "IncentiveGrantService.retryFailedGrant",
      incentiveGrantId,
    };

    let grant: PrismaIncentiveGrant | null = null;

    try {
      // 1. Find the grant record within the transaction
      grant = await this.repository.findInTransaction(ctx, incentiveGrantId, tx);
      if (!grant) {
        throw new NotFoundError("IncentiveGrant", { id: incentiveGrantId });
      }

      logger.info("Retrying failed incentive grant", {
        ...logContext,
        userId: grant.userId,
        communityId: grant.communityId,
        type: grant.type,
        status: grant.status,
        attemptCount: grant.attemptCount,
      });

      // 2. Verify FAILED status
      if (grant.status !== "FAILED") {
        throw new InvalidGrantStatusError(grant.status, "FAILED");
      }

      // 3. Get configuration (only SIGNUP type is supported for now)
      if (grant.type !== IncentiveGrantType.SIGNUP) {
        throw new UnsupportedGrantTypeError(grant.type);
      }

      const config = await this.signupBonusConfigService.get(ctx, grant.communityId, tx);
      if (!config?.isEnabled) {
        throw new IncentiveDisabledError(grant.communityId, "Signup bonus");
      }

      // 4. TOCTOU-safe balance check
      await this.walletService.checkCommunityWalletBalanceInTransaction(
        ctx,
        grant.communityId,
        config.bonusPoint,
        tx,
      );

      // 5. Get wallets
      const [communityWallet, memberWallet] = await Promise.all([
        this.walletService.findCommunityWalletOrThrow(ctx, grant.communityId, tx),
        this.walletService.findMemberWalletOrThrow(ctx, grant.userId, grant.communityId, tx),
      ]);

      // 6. Create transaction
      const transaction = await this.transactionService.grantSignupBonus(
        ctx,
        config.bonusPoint,
        communityWallet.id,
        memberWallet.id,
        grant.userId,
        tx,
        config.message,
      );

      // 7. Mark as COMPLETED
      await this.repository.markAsCompleted(
        ctx,
        grant.userId,
        grant.communityId,
        grant.type,
        grant.sourceId,
        transaction.id,
        tx,
      );

      logger.info("Incentive grant retry succeeded", {
        ...logContext,
        transactionId: transaction.id,
        bonusPoint: config.bonusPoint,
      });

      return {
        success: true,
        transaction: {
          id: transaction.id,
          toPointChange: transaction.toPointChange,
          comment: transaction.comment,
        },
      };
    } catch (error: any) {
      logger.error("Incentive grant retry failed", {
        ...logContext,
        error: error.message,
        stack: error.stack,
      });

      // Try to mark as failed (if it's a business logic error, not validation error)
      // Skip marking as failed for validation errors (NotFoundError, InvalidGrantStatusError, etc.)
      const isValidationError =
        error instanceof NotFoundError ||
        error instanceof InvalidGrantStatusError ||
        error instanceof UnsupportedGrantTypeError ||
        error instanceof IncentiveDisabledError;

      if (!isValidationError && grant) {
        try {
          let failureCode: IncentiveGrantFailureCode;
          if (error instanceof InsufficientBalanceError) {
            failureCode = IncentiveGrantFailureCode.INSUFFICIENT_FUNDS;
          } else if (error?.code?.startsWith("P")) {
            failureCode = IncentiveGrantFailureCode.DATABASE_ERROR;
          } else {
            failureCode = IncentiveGrantFailureCode.UNKNOWN;
          }

          await this.repository.markAsFailed(
            ctx,
            grant.userId,
            grant.communityId,
            grant.type,
            grant.sourceId,
            failureCode,
            error.message,
            tx,
          );
        } catch (markFailedError: any) {
          logger.error("Failed to mark incentive grant as failed during retry", {
            ...logContext,
            error: markFailedError.message,
          });
        }
      }

      // Re-throw the error
      throw error;
    }
  }
}
